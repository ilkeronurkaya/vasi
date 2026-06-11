"""
Vasi API Smoke Test Suite
==========================
Deterministik uçtan uca testler. İzole bir wrangler dev (port 8788, geçici DB)
ayağa kaldırır, temel akışları doğrular, kapatır. Dev ortamına DOKUNMAZ.

Çalıştırma:  python3 crew/tests/api_smoke.py
Çıktı: insan-okur satırlar + son satırda RESULTS_JSON: {...}
Exit code: 0 = hepsi geçti, 1 = en az bir hata.
"""

import json
import re
import shutil
import signal
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
API_DIR = ROOT / "vasi-api"
WEB_SRC = ROOT / "vasi-web" / "src"
WRANGLER = API_DIR / "node_modules" / ".bin" / "wrangler"
STATE = Path(__file__).resolve().parent / ".state"
LOG = Path(__file__).resolve().parent / "wrangler.log"
PORT = 8788
BASE = f"http://127.0.0.1:{PORT}"

TEST_EMAIL = "test@vasi.app"
TEST_PASS = "Test1234!"

results: list[dict] = []


def record(name: str, area: str, owner: str, ok: bool, detail: str = "") -> None:
    results.append({"name": name, "area": area, "owner": owner, "ok": ok, "detail": detail[:300]})
    print(f"  {'✓' if ok else '✗'} [{area}] {name}" + ("" if ok else f" — {detail[:120]}"))


def req(method: str, path: str, body=None, token: str | None = None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(BASE + path, method=method, data=data, headers=headers)
    try:
        with urllib.request.urlopen(r, timeout=20) as resp:
            return resp.status, json.loads(resp.read() or b"{}")
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read() or b"{}")
        except Exception:
            return e.code, {}


def wrangler_cmd(args: list[str], timeout: int = 120) -> subprocess.CompletedProcess:
    return subprocess.run(
        [str(WRANGLER), *args, "--persist-to", str(STATE)],
        cwd=str(API_DIR), capture_output=True, text=True, timeout=timeout,
    )


# ── Statik kontroller (sunucu gerekmez) ──────────────────────────────────────

HOOK_RE = re.compile(r"useState\(|useEffect\(|useRouter\(|usePathname\(|onClick=|onChange=")

def static_checks() -> None:
    # 1. Hook kullanan her sayfada 'use client' ilk anlamlı satır olmalı
    bad = []
    for tsx in sorted((WEB_SRC / "app").rglob("*.tsx")):
        src = tsx.read_text(encoding="utf-8")
        if not HOOK_RE.search(src):
            continue
        first = next((l.strip() for l in src.splitlines() if l.strip() and not l.strip().startswith("//")), "")
        if not first.startswith(("'use client'", '"use client"')):
            bad.append(str(tsx.relative_to(ROOT)))
    record("'use client' direktifi (hook kullanan sayfalar)", "web-static", "UX/UI Ajani",
           not bad, "Eksik: " + ", ".join(bad))

    # 2. routes/ altındaki her dosya index.ts'te import edilmiş olmalı
    index_src = (API_DIR / "src" / "index.ts").read_text(encoding="utf-8")
    unmounted = [f.stem for f in sorted((API_DIR / "src" / "routes").glob("*.ts"))
                 if f"/routes/{f.stem}" not in index_src]
    record("Tüm route dosyaları index.ts'e bağlı", "api-static", "Backend Ajani",
           not unmounted, "Bağlı değil: " + ", ".join(unmounted))

    # 3. globals.css sözdizimi: seçicisiz (başıboş) declaration ve süslü parantez dengesi
    #    (tsc CSS'e bakmaz; ajanlar satır-bazlı düzenlemede artık bırakabiliyor)
    css_path = WEB_SRC / "app" / "globals.css"
    css = re.sub(r"/\*.*?\*/", "", css_path.read_text(encoding="utf-8"), flags=re.DOTALL)
    problems = []
    depth = 0
    for lineno, line in enumerate(css.splitlines(), 1):
        stripped = line.strip()
        if depth == 0 and stripped and not stripped.startswith("@") \
                and "{" not in stripped and "}" not in stripped \
                and stripped.endswith(";") \
                and re.match(r"^[\w-]+\s*:(?!:|hover|focus|active|visited|disabled)", stripped):
            problems.append(f"L{lineno}: seçicisiz declaration: {stripped[:60]}")
        depth += line.count("{") - line.count("}")
        if depth < 0:
            problems.append(f"L{lineno}: fazla kapanan parantez")
            depth = 0
    if depth != 0:
        problems.append(f"dosya sonunda {depth} kapanmamış parantez")
    record("globals.css sözdizimi temiz", "web-static", "UX/UI Ajani",
           not problems, "; ".join(problems[:4]))


# ── API testleri ─────────────────────────────────────────────────────────────

def api_tests() -> None:
    # Auth
    status, body = req("POST", "/api/v1/auth/login", {"email": TEST_EMAIL, "password": TEST_PASS})
    token = body.get("accessToken", "")
    record("Login (seed kullanıcı)", "auth", "Backend Ajani",
           status == 200 and bool(token), f"status={status} body={body}")
    if not token:
        return  # geri kalanı token ister

    # Mesaj oluşturma — id dönmeli (regresyon: 'Message not found' bug'ı)
    status, msg = req("POST", "/api/v1/messages",
                      {"title": "Smoke Test Mesajı", "message_type": "text",
                       "content_text": "Bu otomatik test mesajıdır."}, token)
    msg_id = (msg or {}).get("id")
    record("Mesaj oluşturma yanıtı id içeriyor", "messages", "Backend Ajani",
           status == 201 and bool(msg_id), f"status={status} body={msg}")

    # Liste
    status, lst = req("GET", "/api/v1/messages", None, token)
    record("Mesaj listesi dönüyor", "messages", "Backend Ajani",
           status == 200 and isinstance(lst, list) and len(lst) >= 1, f"status={status}")

    if msg_id:
        # Alıcı ekleme
        status, rec_ = req("POST", f"/api/v1/messages/{msg_id}/recipients",
                           {"full_name": "Smoke Alıcı", "email": "smoke@test.dev"}, token)
        record("Alıcı ekleme", "messages", "Backend Ajani", status == 201, f"status={status} body={rec_}")

        # Detay alıcıları içermeli
        status, detail = req("GET", f"/api/v1/messages/{msg_id}", None, token)
        recs = (detail or {}).get("recipients", [])
        record("Mesaj detayı alıcıları içeriyor", "messages", "Backend Ajani",
               status == 200 and len(recs) == 1, f"status={status} recipients={len(recs)}")

        # Zamanlama
        status, sch = req("POST", f"/api/v1/messages/{msg_id}/schedule",
                          {"scheduled_at": "2036-01-01T09:00:00.000Z"}, token)
        record("Mesaj zamanlama", "delivery", "Backend Ajani",
               status in (200, 201), f"status={status} body={sch}")

        # Geçmiş tarihe zamanlama reddedilmeli (Sprint 16 Task 2)
        status, past = req("POST", f"/api/v1/messages/{msg_id}/schedule",
                           {"scheduled_at": "2020-01-01T09:00:00.000Z"}, token)
        record("Geçmiş tarihe zamanlama 400 dönüyor", "delivery", "Backend Ajani",
               status == 400, f"status={status} body={past}")

    # /me
    status, me = req("GET", "/api/v1/me", None, token)
    usage = (me or {}).get("usage", {})
    record("/me kullanıcı + kullanım dönüyor", "me", "Backend Ajani",
           status == 200 and me.get("user", {}).get("email") == TEST_EMAIL
           and usage.get("messages_used", 0) >= 1, f"status={status} body={me}")

    # Admin login (is_admin setup main() içinde yapıldı)
    status, adm = req("POST", "/api/v1/admin/auth/login", {"email": TEST_EMAIL, "password": TEST_PASS})
    admin_token = (adm or {}).get("accessToken", "")
    record("Admin login", "admin", "Backend Ajani",
           status == 200 and bool(admin_token), f"status={status} body={adm}")
    if not admin_token:
        return

    # İstatistikler
    status, ov = req("GET", "/api/v1/admin/stats/overview", None, admin_token)
    record("Admin stats/overview", "admin", "Backend Ajani",
           status == 200 and (ov or {}).get("total_users", 0) >= 3, f"status={status} body={ov}")

    # Ayar güncelleme → limit zorlaması
    status, _ = req("PUT", "/api/v1/admin/settings", {"key": "plan_limit_free", "value": "1"}, admin_token)
    record("Admin ayar güncelleme", "admin", "Backend Ajani", status == 200, f"status={status}")

    status, lim = req("POST", "/api/v1/messages",
                      {"title": "Limit testi", "message_type": "text", "content_text": "limit"}, token)
    record("Plan limiti uygulanıyor (403 LIMIT_REACHED)", "messages", "Backend Ajani",
           status == 403 and (lim or {}).get("code") == "LIMIT_REACHED", f"status={status} body={lim}")

    req("PUT", "/api/v1/admin/settings", {"key": "plan_limit_free", "value": "10"}, admin_token)

    # Gelir raporu
    status, rev = req("GET", "/api/v1/admin/reports/revenue", None, admin_token)
    record("Admin gelir raporu", "admin", "Backend Ajani",
           status == 200 and "total_monthly_revenue" in (rev or {}), f"status={status}")

    # Public pricing — auth'suz çalışmalı ve admin değişikliğini yansıtmalı
    status, pub = req("GET", "/api/v1/public/pricing")
    record("Public pricing endpoint (auth'suz)", "public", "Backend Ajani",
           status == 200 and "price_personal_monthly" in (pub or {}).get("pricing", {}),
           f"status={status} body={pub}")

    req("PUT", "/api/v1/admin/settings", {"key": "price_personal_monthly", "value": "59"}, admin_token)
    status, pub2 = req("GET", "/api/v1/public/pricing")
    record("Admin fiyat değişikliği public'e yansıyor", "public", "Backend Ajani",
           status == 200 and (pub2 or {}).get("pricing", {}).get("price_personal_monthly") == "59",
           f"status={status} body={pub2}")
    req("PUT", "/api/v1/admin/settings", {"key": "price_personal_monthly", "value": "49"}, admin_token)

    # Manuel teslimat tetikleyici (Sprint 16 Task 3) — sayaçlar dönmeli
    status, dr = req("POST", "/api/v1/admin/delivery/run-due", {}, admin_token)
    record("Admin manuel teslimat tetikleyici", "delivery", "Backend Ajani",
           status == 200 and "delivered" in (dr or {}), f"status={status} body={dr}")

    # Vade sorgusu regresyonu: zamanlanmış mesajın vadesini geçmişe çek →
    # run-due onu İŞLEMELİ (eski string karşılaştırma bug'ında 0/0 dönüyordu).
    # E-posta başarısı önemli değil (test alıcısı sahte) — delivered+failed >= 1 yeterli.
    wrangler_cmd(["d1", "execute", "vasi-db", "--local", "--command",
                  "UPDATE messages SET scheduled_at='2020-01-01T00:00:00.000Z' WHERE status='scheduled'"])
    status, dr2 = req("POST", "/api/v1/admin/delivery/run-due", {}, admin_token)
    processed = ((dr2 or {}).get("delivered", 0) or 0) + ((dr2 or {}).get("failed", 0) or 0)
    record("Vadesi gelen mesaj run-due ile işleniyor (datetime normalize)", "delivery", "Backend Ajani",
           status == 200 and processed >= 1, f"status={status} body={dr2}")

    # Sprint 17: teslimat alıcıya access_token üretmeli (e-posta başarısız olsa bile token yazılır)
    tok = wrangler_cmd(["d1", "execute", "vasi-db", "--local", "--json",
                        "--command", "SELECT access_token FROM recipients WHERE access_token IS NOT NULL LIMIT 1"])
    token_val = ""
    m2 = re.search(r'"access_token":\s*"([a-f0-9]{32,})"', tok.stdout)
    if m2:
        token_val = m2.group(1)
    record("Teslimatta erişim token'ı üretiliyor", "delivery", "Backend Ajani",
           bool(token_val), tok.stdout[-200:] if not token_val else "")

    # Sprint 17: public görüntüleme endpoint'i
    if token_val:
        status, view = req("GET", f"/api/v1/public/view/{token_val}")
        record("Public görüntüleme endpoint'i mesajı dönüyor", "public", "Backend Ajani",
               status == 200 and "content_text" in (view or {}) and "sender_name" in (view or {}),
               f"status={status} body={view}")
    status, bad = req("GET", "/api/v1/public/view/gecersiztokendeneme1234567890abcdef")
    record("Geçersiz token 404 dönüyor", "public", "Backend Ajani",
           status == 404, f"status={status}")


# ── Ana akış ──────────────────────────────────────────────────────────────────

def main() -> int:
    print("Vasi Smoke Test — başlatılıyor")
    static_checks()

    # Temiz state
    shutil.rmtree(STATE, ignore_errors=True)
    STATE.mkdir(parents=True, exist_ok=True)

    # Migration'lar
    mig = wrangler_cmd(["d1", "migrations", "apply", "vasi-db", "--local"])
    if mig.returncode != 0:
        record("Migration'lar uygulanıyor", "db", "Backend Ajani", False, mig.stdout[-200:] + mig.stderr[-200:])
        return finish()
    record("Migration'lar uygulanıyor", "db", "Backend Ajani", True)

    # Test kullanıcısını admin yap
    wrangler_cmd(["d1", "execute", "vasi-db", "--local",
                  "--command", f"UPDATE users SET is_admin=1 WHERE email='{TEST_EMAIL}'"])

    # İzole API sunucusu
    log_f = open(LOG, "w")
    proc = subprocess.Popen(
        [str(WRANGLER), "dev", "--port", str(PORT), "--persist-to", str(STATE)],
        cwd=str(API_DIR), stdout=log_f, stderr=subprocess.STDOUT, start_new_session=True,
    )
    try:
        ready = False
        for _ in range(60):
            time.sleep(1)
            try:
                status, _b = req("POST", "/api/v1/auth/login", {})
                ready = True
                break
            except Exception:
                continue
        record("Test API sunucusu ayakta (:8788)", "infra", "Backend Ajani", ready,
               "" if ready else f"60sn'de açılmadı — log: {LOG}")
        if ready:
            api_tests()
    finally:
        try:
            import os
            os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
        except Exception:
            proc.terminate()
        log_f.close()

    return finish()


def finish() -> int:
    failed = [r for r in results if not r["ok"]]
    print(f"\nSonuç: {len(results) - len(failed)}/{len(results)} geçti")
    print("RESULTS_JSON: " + json.dumps({"passed": len(results) - len(failed),
                                         "failed": len(failed), "failures": failed}, ensure_ascii=False))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
