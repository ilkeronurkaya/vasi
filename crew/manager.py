"""
Vasi — Agent Manager (Chainlit Chat Arayüzü)
=============================================
Kullanıcının agent ekibiyle konuşmasını sağlar.

Çalıştırmak için:
  cd crew/
  chainlit run manager.py

Komutlar:
  sprint 1       — Sprint 1'i başlat
  durum          — Mevcut sprint durumu
  sprintler      — Tüm sprint listesi
  log            — Son log kayıtları
  yardım         — Bu yardım mesajı
"""

import asyncio
import os
import re
import signal
import subprocess
from datetime import datetime
from pathlib import Path

import chainlit as cl

# crew modülünü import et (aynı dizinde)
import sys
sys.path.insert(0, str(Path(__file__).parent))
from crew import run_sprint, ROOT, MODEL, MODEL_STRONG, MODEL_FAST, LOG_FILE, check_builds, check_ux_rules

# ── Sabitler ─────────────────────────────────────────────────────────────────

SPRINTS = {
    1: "Auth sistemi (register, login, verify-email)",
    2: "Mesaj CRUD + Alıcı yönetimi",
    3: "Zamanlama + E-posta iletimi",
    4: "İyzico ödeme entegrasyonu",
    5: "UX/UI — Auth & Dashboard tasarımı",
    6: "UX/UI — Mesaj akışı tasarımı (new, detail, schedule)",
    7: "UX/UI — Dashboard yenileme (wizard, limit, abonelik, ana sayfa)",
}

HELP_TEXT = """
**Kullanılabilir komutlar:**

| Komut | Açıklama |
|-------|----------|
| `sprint 1` | Sprint 1'i başlat |
| `durum` | Mevcut sprint durumunu göster |
| `sprintler` | Tüm sprint listesi |
| `log` | Son log kayıtları |
| `kontrol` | TypeScript build + UX/UI kural ihlallerini tara |
| `dev` | API (:8787) + Web (:3000) sunucularını arka planda başlat |
| `durdur` | Dev sunucularını kapat |
| `migrate` | Lokal D1 migration'larını uygula |
| `yardım` | Bu mesajı göster |

**Notlar:**
- Sprint çalışırken yeni sprint başlatılamaz
- `git log --oneline` ile commit'leri görebilirsiniz
- Build hatası varsa ajan otomatik düzeltir, ardından commit atar
"""

# ── Sprint Durumu ─────────────────────────────────────────────────────────────

_state: dict = {
    "sprint":     None,   # aktif sprint numarası
    "status":     "idle", # idle | running | done | error
    "start_time": None,
    "error":      None,
}

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

    if t in ("dev", "test") or any(w in t for w in ["sunucu", "dev başlat", "serve"]):
        return "start_dev", {}

    if any(w in t for w in ["migrate", "migration", "db kur"]):
        return "migrate", {}

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


# ── Log Okuyucu ───────────────────────────────────────────────────────────────

def read_log(last_n: int = 20) -> str:
    if not LOG_FILE.exists():
        return "Henüz log yok."
    lines = LOG_FILE.read_text(encoding="utf-8").splitlines()
    return "\n".join(lines[-last_n:]) if lines else "Log boş."


# ── Chainlit Handlers ─────────────────────────────────────────────────────────

@cl.on_chat_start
async def on_start():
    await cl.Message(
        content=(
            "## 🕰️ Vasi Agent Manager\n\n"
            f"**Güçlü model:** `{MODEL_STRONG}` — karmaşık görevler\n"
            f"**Hızlı model:** `{MODEL_FAST}` — basit görevler (otomatik routing)\n"
            f"**Root:** `{ROOT}`\n\n"
            + HELP_TEXT
        )
    ).send()


@cl.on_message
async def on_message(message: cl.Message):
    intent, params = detect_intent(message.content)

    # ── Sprint Başlat ──────────────────────────────────────────────────────
    if intent == "start_sprint":
        n = params["number"]
        sprint_file = Path(__file__).parent / f"sprint{n}.py"

        if not sprint_file.exists():
            await cl.Message(
                content=f"❌ `sprint{n}.py` bulunamadı. Önce sprint dosyasını oluşturmanız gerekiyor."
            ).send()
            return

        if _state["status"] == "running":
            await cl.Message(
                content=(
                    f"⚠️ Sprint {_state['sprint']} zaten çalışıyor.\n"
                    "Tamamlanmasını bekleyin ya da `log` ile durumu kontrol edin."
                )
            ).send()
            return

        desc = SPRINTS.get(n, "Tanımsız")

        # Sprint dosyasından agent rollerini oku
        try:
            from crew import load_sprint, TaskSpec
            preview_tasks = load_sprint(n)
            agent_line = " → ".join(f"**{t.role}**" for t in preview_tasks)
        except Exception:
            agent_line = "Ajanlar yükleniyor..."

        _state.update(sprint=n, status="running", start_time=datetime.now(), error=None)

        msg = await cl.Message(
            content=(
                f"🚀 **Sprint {n} başlatılıyor...**\n\n"
                f"**Kapsam:** {desc}\n\n"
                f"**Ajanlar:** {agent_line}\n"
                "Her ajan kod yazdıktan sonra build kontrol eder; başarılıysa commit atar.\n\n"
                f"_Güçlü: `{MODEL_STRONG}` / Hızlı: `{MODEL_FAST}` — otomatik routing_"
            )
        ).send()

        try:
            result = await asyncio.to_thread(run_sprint, n)
            elapsed = datetime.now() - _state["start_time"]
            mins, secs = elapsed.seconds // 60, elapsed.seconds % 60
            _state["status"] = "done"

            # Per-agent timer tablosu
            task_rows = []
            if isinstance(result, dict) and "tasks" in result:
                task_rows.append("\n| Agent | Durum | Süre |")
                task_rows.append("|-------|-------|------|")
                for t in result["tasks"]:
                    icon = "✅" if t["status"] == "OK" else "❌"
                    m, s = int(t["elapsed"]) // 60, int(t["elapsed"]) % 60
                    task_rows.append(f"| {t['role']} | {icon} {t['status'][:30]} | {m}dk {s}sn |")
                summary = result.get("summary", "")
            else:
                summary = str(result)[:500]

            await cl.Message(
                content=(
                    f"✅ **Sprint {n} tamamlandı!**\n\n"
                    f"⏱️ Toplam süre: {mins}dk {secs}sn\n"
                    + "\n".join(task_rows) +
                    f"\n\nCommit'leri görmek için:\n"
                    f"```bash\ngit log --oneline sprint-{n}\n```"
                )
            ).send()

        except Exception as e:
            _state["status"] = "error"
            _state["error"] = str(e)

            await cl.Message(
                content=(
                    f"❌ **Sprint {n} başarısız!**\n\n"
                    f"```\n{str(e)[:800]}\n```\n\n"
                    "`log` yazarak detaylara bakabilirsiniz."
                )
            ).send()

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
