"""
Vasi — Süreç Paneli (Chainlit Chat Arayüzü)
============================================
Crew (yerel LLM kod yazımı) 2026-06-12'de emekli edildi (bkz. HANDOFF.md).
Bu panel artık deterministik süreç araçlarını yönetir: test, dev sunucuları,
migration, kontrol, log ve bildirimler. Kod yazımı: Claude (sohbet üzerinden).

Çalıştırmak için:
  cd crew/
  chainlit run manager.py

Komutlar:
  test           — Smoke testleri koş (salt rapor, otomatik düzelttirme yok)
  durum / log    — Durum ve son log kayıtları
  dev / durdur   — Dev sunucularını yönet
  migrate        — Lokal D1 migration
  yardım         — Bu yardım mesajı
"""

import asyncio
import json
import os
import re
import signal
import subprocess
import threading
import time
import urllib.request
from datetime import datetime
from pathlib import Path

import chainlit as cl

# crew modülünü import et (aynı dizinde)
import sys
sys.path.insert(0, str(Path(__file__).parent))
from crew import run_smoke_tests, ROOT, LOG_FILE, check_builds, check_ux_rules

CREW_RETIRED_MSG = (
    "🪦 **Crew emekli (2026-06-12).** Sprint koşturma kapalı — kod işleri artık "
    "Claude ile sohbette yürüyor (bkz. `HANDOFF.md`, CREW KARARI). "
    "Bu panel test/dev/migrate/log/bildirim için kullanılmaya devam ediyor."
)

# ── Sabitler ─────────────────────────────────────────────────────────────────

SPRINTS = {
    1: "Auth sistemi (register, login, verify-email)",
    2: "Mesaj CRUD + Alıcı yönetimi",
    3: "Zamanlama + E-posta iletimi",
    4: "İyzico ödeme entegrasyonu",
    5: "UX/UI — Auth & Dashboard tasarımı",
    6: "UX/UI — Mesaj akışı tasarımı (new, detail, schedule)",
    7: "UX/UI — Dashboard yenileme (wizard, limit, abonelik, ana sayfa)",
    8: "Gerçek veri entegrasyonu (/me, recipient_count, mock temizliği)",
    9: "Eksikleri kapatma (plan limiti, /messages listesi, detay alıcıları)",
    10: "Apple tasarım dili (tokenler, buzlu cam sidebar, form/kart restyle)",
    14: "Admin Panel UI (login, layout, genel bakış, kullanıcılar, raporlar, ayarlar)",
    15: "Buton sistemi v2 + UI cilası (upgrade, boş durumlar, mobil sidebar)",
    16: "E-posta teslimatı uçtan uca (EMAIL_FROM, tarih engeli, manuel tetikleyici)",
    17: "Teslimat deneyimi (erişim token'ı, görüntüleme endpoint'i + Claude: e-posta tasarımı, /m sayfası)",
}

HELP_TEXT = """
**Kullanılabilir komutlar:**

| Komut | Açıklama |
|-------|----------|
| `test` | Smoke testleri koş (salt rapor — düzeltme Claude'da) |
| `kontrol` | TypeScript build + UX/UI kural ihlallerini tara |
| `dev` | API (:8787) + Web (:3000) sunucularını arka planda başlat |
| `durdur` | Dev sunucularını kapat |
| `migrate` | Lokal D1 migration'larını uygula |
| `log` | Son log kayıtları |
| `sprintler` | Geçmiş sprint listesi (arşiv) |
| `bildirim` | Telefona test bildirimi gönder (ntfy) |
| `yardım` | Bu mesajı göster |

**Not:** Crew emekli — `sprint N` koşturma kapalı. Kod işleri Claude ile yürür;
test kırmızıysa bulguyu Claude'a taşı.
"""

# ── Sprint Durumu ─────────────────────────────────────────────────────────────

_state: dict = {
    "sprint":     None,   # aktif sprint numarası
    "status":     "idle", # idle | running | done | error
    "start_time": None,
    "error":      None,
}

# ── Bildirim (ntfy.sh) ────────────────────────────────────────────────────────
# Telefonda ntfy uygulamasıyla bu konuya abone ol: vasi-iko-7ca81627

NTFY_TOPIC = "vasi-iko-7ca81627"          # bildirimler (manager → telefon)
NTFY_CMD_TOPIC = "vasi-iko-cmd-57f994b1"  # komutlar (telefon → manager)

# iMessage hedefi: kendi Apple ID'n veya telefon numaran (örn: "+905xxxxxxxxx")
IMESSAGE_TO = "ilkeronurkaya@gmail.com"

def _notify_imessage(text: str) -> bool:
    """Mac'teki Mesajlar uygulamasından iMessage gönderir. Hata olursa sessizce geçer."""
    script = (
        'tell application "Messages"\n'
        '  set targetService to 1st account whose service type = iMessage\n'
        f'  set targetBuddy to participant "{IMESSAGE_TO}" of targetService\n'
        f'  send "{text}" to targetBuddy\n'
        'end tell'
    )
    try:
        r = subprocess.run(
            ["osascript", "-e", script],
            capture_output=True, text=True, timeout=15,
        )
        return r.returncode == 0
    except Exception:
        return False

def _notify(title: str, message: str, tags: str = "bell") -> bool:
    """Sprint bitince telefona push bildirimi atar. Hata olursa sessizce geçer."""
    try:
        import urllib.request
        req = urllib.request.Request(
            f"https://ntfy.sh/{NTFY_TOPIC}",
            data=message.encode("utf-8"),
            headers={"Title": title.encode("ascii", "ignore").decode(),
                     "Tags": tags, "Priority": "high"},
        )
        urllib.request.urlopen(req, timeout=10)
        return True
    except Exception:
        return False


# ── Dev sunucu yönetimi ───────────────────────────────────────────────────────

_dev_procs: dict = {"api": None, "web": None}
DEV_LOGS = {"api": Path(__file__).parent / "dev-api.log",
            "web": Path(__file__).parent / "dev-web.log"}

def _proc_alive(p) -> bool:
    return p is not None and p.poll() is None

def _start_dev() -> str:
    lines = []
    cmds = {"api": "pnpm dev:api", "web": "pnpm dev:web"}
    ports = {"api": "http://localhost:8787", "web": "http://localhost:3000"}
    for name, cmd in cmds.items():
        if _proc_alive(_dev_procs[name]):
            lines.append(f"- ⚡ {name} zaten çalışıyor — {ports[name]}")
            continue
        log_f = open(DEV_LOGS[name], "w")
        _dev_procs[name] = subprocess.Popen(
            cmd, shell=True, cwd=str(ROOT),
            stdout=log_f, stderr=subprocess.STDOUT,
            start_new_session=True,
        )
        lines.append(f"- 🚀 {name} başlatıldı — {ports[name]} (log: crew/dev-{name}.log)")
    return "\n".join(lines)

def _stop_dev() -> str:
    lines = []
    for name, p in _dev_procs.items():
        if _proc_alive(p):
            try:
                os.killpg(os.getpgid(p.pid), signal.SIGTERM)
                lines.append(f"- 🛑 {name} durduruldu")
            except Exception as e:
                lines.append(f"- ⚠ {name} durdurulamadı: {e}")
            _dev_procs[name] = None
        else:
            lines.append(f"- 💤 {name} zaten kapalı")
    return "\n".join(lines)

def _run_migrate() -> str:
    r = subprocess.run(
        "pnpm db:migrate:local", shell=True, cwd=str(ROOT),
        capture_output=True, text=True, timeout=180,
    )
    out = (r.stdout + r.stderr).strip()
    tail = "\n".join(out.splitlines()[-15:])
    icon = "✅" if r.returncode == 0 else "❌"
    return f"{icon} Migration (exit {r.returncode}):\n```\n{tail}\n```"

# ── Intent Tespiti ────────────────────────────────────────────────────────────

def detect_intent(text: str) -> tuple[str, dict]:
    t = text.lower().strip()

    m = re.search(r'sprint\s*(\d+)', t)
    if m:
        return "start_sprint", {"number": int(m.group(1))}

    if any(w in t for w in ["durdur", "stop", "kapat"]):
        return "stop_dev", {}

    if t in ("test", "testler", "smoke") or "smoke" in t or "testleri" in t:
        return "run_tests", {}

    if t == "dev" or any(w in t for w in ["sunucu", "dev başlat", "serve"]):
        return "start_dev", {}

    if any(w in t for w in ["migrate", "migration", "db kur"]):
        return "migrate", {}

    if any(w in t for w in ["bildirim", "notify", "ntfy"]):
        return "test_notify", {}

    if any(w in t for w in ["durum", "status", "ne yapıyor", "nerede", "ilerliyor"]):
        return "status", {}

    if any(w in t for w in ["sprintler", "sprint listesi", "planlar", "ne var"]):
        return "list_sprints", {}

    if any(w in t for w in ["log", "hata", "çıktı", "son", "output"]):
        return "show_log", {}

    if any(w in t for w in ["kontrol", "doğrula", "validate", "check", "lint"]):
        return "validate", {}

    if any(w in t for w in ["yardım", "help", "komut", "ne yapabilir", "?"]):
        return "help", {}

    return "unknown", {}


# ── Test koşucu (salt rapor — LLM düzelttirme yok, crew emekli) ──────────────

def _run_tests_plain() -> str:
    data = run_smoke_tests()
    if data["failed"] == 0:
        return f"✅ {data['passed']}/{data['passed']} test geçti"
    lines = [f"❌ {data['failed']} başarısız, {data['passed']} geçti:"]
    for f in data["failures"][:10]:
        lines.append(f"- [{f.get('area', '?')}] {f.get('name', '?')} — {str(f.get('detail', ''))[:120]}")
    lines.append("\nDüzeltme için bulguları Claude'a taşı (otomatik düzelttirme kapalı).")
    return "\n".join(lines)


# ── Log Okuyucu ───────────────────────────────────────────────────────────────

def read_log(last_n: int = 20) -> str:
    if not LOG_FILE.exists():
        return "Henüz log yok."
    lines = LOG_FILE.read_text(encoding="utf-8").splitlines()
    return "\n".join(lines[-last_n:]) if lines else "Log boş."


# ── Canlı log akışlı çalıştırıcı ──────────────────────────────────────────────

async def _run_with_live_log(fn, *args, header: str):
    """Bloklayan fn'i thread'de koşarken sprint.log'un yeni satırlarını
    Chainlit mesajında canlı gösterir. fn'in sonucunu döner."""
    start_pos = LOG_FILE.stat().st_size if LOG_FILE.exists() else 0
    live = cl.Message(content=header + "\n_(loglar burada canlı akacak...)_")
    await live.send()

    task = asyncio.create_task(asyncio.to_thread(fn, *args))
    last_tail = ""
    while not task.done():
        await asyncio.sleep(3)
        try:
            with open(LOG_FILE, encoding="utf-8") as f:
                f.seek(start_pos)
                new = f.read()
            tail = "\n".join(new.splitlines()[-14:])
            if tail and tail != last_tail:
                last_tail = tail
                live.content = header + "\n```\n" + tail + "\n```"
                await live.update()
        except Exception:
            pass
    return task.result()


# ── Chainlit Handlers ─────────────────────────────────────────────────────────

@cl.on_chat_start
async def on_start():
    await cl.Message(
        content=(
            "## 🕰️ Vasi Süreç Paneli\n\n"
            f"**Root:** `{ROOT}`\n"
            "**Mod:** Crew emekli — kod işleri Claude'da, burası süreç paneli.\n\n"
            + HELP_TEXT
        )
    ).send()


@cl.on_message
async def on_message(message: cl.Message):
    intent, params = detect_intent(message.content)

    # ── Sprint Başlat — KAPALI (crew emekli, 2026-06-12) ──────────────────
    if intent == "start_sprint":
        await cl.Message(content=CREW_RETIRED_MSG).send()

    # ── Durum ─────────────────────────────────────────────────────────────
    elif intent == "status":
        s = _state["status"]

        if s == "idle":
            content = "💤 Şu anda çalışan sprint yok.\n\n`sprint 1` yazarak başlatabilirsiniz."

        elif s == "running":
            elapsed = datetime.now() - _state["start_time"]
            mins, secs = elapsed.seconds // 60, elapsed.seconds % 60
            content = (
                f"⚡ **Sprint {_state['sprint']} çalışıyor**\n\n"
                f"⏱️ Geçen süre: {mins}dk {secs}sn\n\n"
                "`log` ile son çıktıyı görebilirsiniz."
            )

        elif s == "done":
            elapsed = datetime.now() - _state["start_time"]
            mins, secs = elapsed.seconds // 60, elapsed.seconds % 60
            content = (
                f"✅ Sprint **{_state['sprint']}** tamamlandı\n"
                f"⏱️ Süre: {mins}dk {secs}sn"
            )

        else:  # error
            content = (
                f"❌ Sprint {_state['sprint']} başarısız\n\n"
                f"```\n{_state['error']}\n```"
            )

        await cl.Message(content=content).send()

    # ── Sprint Listesi ────────────────────────────────────────────────────
    elif intent == "list_sprints":
        rows = ["| Sprint | Kapsam | Dosya |", "|--------|--------|-------|"]
        for n, desc in SPRINTS.items():
            exists = (Path(__file__).parent / f"sprint{n}.py").exists()
            icon = "✅ Hazır" if exists else "🔜 Yazılacak"
            rows.append(f"| {n} | {desc} | {icon} |")

        await cl.Message(content="\n".join(rows)).send()

    # ── Kontrol ───────────────────────────────────────────────────────────
    elif intent == "validate":
        lines = ["## 🔍 Proje Doğrulama Raporu\n"]

        # TypeScript build
        build = check_builds()
        lines.append("### TypeScript Build")
        all_ok = True
        for proj, err in build.items():
            if err is None:
                lines.append(f"- ✅ `{proj}` — temiz")
            else:
                lines.append(f"- ❌ `{proj}` — hata var\n```\n{err[:400]}\n```")
                all_ok = False

        # UX/UI kuralları
        lines.append("\n### UX/UI Kural Kontrolü")
        ux = check_ux_rules()
        if not ux:
            lines.append("- ✅ Kural ihlali yok")
        else:
            all_ok = False
            total = sum(len(v["violations"]) for v in ux)
            lines.append(f"- ❌ {total} ihlal, {len(ux)} dosya:")
            for item in ux:
                lines.append(f"\n**`{item['file']}`**")
                for v in item["violations"]:
                    lines.append(f"  {v}")

        lines.append(f"\n{'✅ Her şey temiz!' if all_ok else '⚠️ Yukarıdaki sorunları düzeltmek için `sprint` çalıştır veya manuel düzelt.'}")
        await cl.Message(content="\n".join(lines)).send()

    # ── Dev sunucuları ────────────────────────────────────────────────────
    elif intent == "start_dev":
        result = await asyncio.to_thread(_start_dev)
        await cl.Message(
            content=(
                "## 🖥️ Dev Sunucuları\n\n" + result +
                "\n\n**Test:** http://localhost:3000 — `test@vasi.app / Test1234!`\n"
                "Kapatmak için: `durdur`"
            )
        ).send()

    elif intent == "stop_dev":
        result = await asyncio.to_thread(_stop_dev)
        await cl.Message(content="## 🖥️ Dev Sunucuları\n\n" + result).send()

    elif intent == "migrate":
        result = await asyncio.to_thread(_run_migrate)
        await cl.Message(content=result).send()

    elif intent == "run_tests":
        msg = await cl.Message(content="🧪 Smoke testler koşuyor (izole DB, ~1-2 dk)...")
        await msg.send()
        result = await asyncio.to_thread(_run_tests_plain)
        await cl.Message(content=f"## 🧪 Test Sonucu\n\n{result}\n\nDetay: `crew/tests/wrangler.log`").send()

    elif intent == "test_notify":
        ok_ntfy = await asyncio.to_thread(
            _notify, "Vasi Manager", "Test bildirimi — kurulum çalışıyor 🎉", "tada"
        )
        ok_im = await asyncio.to_thread(
            _notify_imessage, "Patron bu bir test mesajı. Bilgine."
        )
        await cl.Message(
            content=(
                f"- ntfy: {'✅ gönderildi' if ok_ntfy else '❌ başarısız'} (konu: `{NTFY_TOPIC}`)\n"
                f"- iMessage: {'✅ gönderildi' if ok_im else '❌ başarısız'} (hedef: `{IMESSAGE_TO}`)\n\n"
                "iMessage ilk seferde macOS izin penceresi açabilir — 'İzin Ver' de."
            )
        ).send()

    # ── Log ───────────────────────────────────────────────────────────────
    elif intent == "show_log":
        log = read_log(30)
        await cl.Message(content=f"```\n{log}\n```").send()

    # ── Yardım ────────────────────────────────────────────────────────────
    elif intent == "help":
        await cl.Message(content=HELP_TEXT).send()

    # ── Bilinmiyor ────────────────────────────────────────────────────────
    else:
        await cl.Message(
            content=(
                "🤔 Komutu anlayamadım.\n\n"
                "Örnekler: `sprint 1`, `durum`, `sprintler`, `log`, `yardım`"
            )
        ).send()


# ── Uzaktan komut kanalı (telefon → ntfy → manager) ──────────────────────────

def _remote_reply(text: str) -> None:
    _notify("Vasi Manager", text[:3500], tags="speech_balloon")


def _handle_remote_command(text: str) -> None:
    intent, params = detect_intent(text)

    if intent == "start_sprint":
        _remote_reply("🪦 Crew emekli — sprint koşturma kapalı. Kod işleri Claude'da (HANDOFF.md).")

    elif intent == "status":
        s = _state["status"]
        if s == "running":
            el = datetime.now() - _state["start_time"]
            _remote_reply(f"⚡ Sprint {_state['sprint']} çalışıyor — {el.seconds // 60}dk {el.seconds % 60}sn oldu.")
        elif s == "done":
            _remote_reply(f"✅ Sprint {_state['sprint']} tamamlandı.")
        elif s == "error":
            _remote_reply(f"❌ Sprint {_state['sprint']} hata verdi: {str(_state['error'])[:200]}")
        else:
            _remote_reply("💤 Çalışan sprint yok.")

    elif intent == "show_log":
        _remote_reply("Son log:\n" + read_log(10))

    elif intent == "list_sprints":
        rows = [f"{n}: {d}" for n, d in SPRINTS.items()]
        _remote_reply("Sprintler:\n" + "\n".join(rows))

    elif intent == "validate":
        build = check_builds()
        parts = [f"{'✅' if e is None else '❌'} {p}" for p, e in build.items()]
        ux = check_ux_rules()
        parts.append("✅ UX kuralları" if not ux else f"❌ UX: {len(ux)} dosyada ihlal")
        _remote_reply("Kontrol:\n" + "\n".join(parts))

    elif intent == "run_tests":
        _remote_reply("🧪 Testler koşuluyor — sonuç birazdan...")
        _remote_reply(_run_tests_plain())

    elif intent == "migrate":
        _remote_reply(_run_migrate()[:3000])

    elif intent == "start_dev":
        _remote_reply(_start_dev())

    elif intent == "stop_dev":
        _remote_reply(_stop_dev())

    elif intent == "help":
        _remote_reply("Komutlar: test, durum, log, sprintler, kontrol, migrate, dev, durdur (sprint koşturma kapalı — crew emekli)")

    else:
        _remote_reply(f"🤔 Anlayamadım: '{text[:50]}' — 'yardım' yaz.")


def _ntfy_listener() -> None:
    """ntfy komut konusunu dinler; kopan bağlantıyı 5 sn sonra yeniden kurar."""
    while True:
        try:
            req = urllib.request.Request(f"https://ntfy.sh/{NTFY_CMD_TOPIC}/json")
            with urllib.request.urlopen(req) as resp:
                for line in resp:
                    try:
                        msg = json.loads(line)
                    except ValueError:
                        continue
                    if msg.get("event") == "message" and msg.get("message"):
                        _handle_remote_command(msg["message"].strip())
        except Exception:
            pass
        time.sleep(5)


_listener_started = False

def _start_ntfy_listener() -> None:
    global _listener_started
    if not _listener_started:
        _listener_started = True
        threading.Thread(target=_ntfy_listener, daemon=True).start()

_start_ntfy_listener()
