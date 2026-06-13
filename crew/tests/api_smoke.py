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
import base64
import hashlib
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
    status, body = req("POST", "/api/v1/auth/login", {})
    record("Login eksik girdi 400 dönüyor", "auth", "Backend Ajani",
           status == 400 and body.get("code") == "VALIDATION_ERROR",
           f"status={status} body={str(body)[:120]}")

    # Login (seed kullanıcı)
    status, body = req("POST", "/api/v1/auth/login", {"email": TEST_EMAIL, "password": TEST_PASS})
    token = body.get("accessToken", "")
    record("Login (seed kullanıcı)", "auth", "Backend Ajani",
           status == 200 and bool(token), f"status={status} body={body}")
    if not token:
        return  # geri kalanı token ister

    # Admin login
    status, auth = req("POST", "/api/v1/admin/auth/login", {"email": TEST_EMAIL, "password": TEST_PASS})
    admin_token = auth.get("accessToken", "")
    record("Admin login", "admin", "Backend Ajani", status == 200 and bool(admin_token))

    # --- PLAN CRUD TESTLERİ ---
    # Deterministiklik: önceki koşulardan kalan test planlarını temizle
    status, _existing = req("GET", "/api/v1/admin/plans", None, admin_token)
    for _p in (_existing.get("plans", []) if _existing else []):
        if _p["slug"] in ("test_plan", "unused_plan"):
            req("DELETE", f"/api/v1/admin/plans/{_p['id']}", None, admin_token)
    # POST plan
    status, _ = req("POST", "/api/v1/admin/plans", 
                    {"slug": "test_plan", "name": "Test Plan", "price_monthly": 10, "message_limit": 50, "recipient_limit": 50}, admin_token)
    record("Plan oluşturma (201)", "admin-plans", "Backend Ajani", status == 201)
    
    # POST same slug -> 409
    status, _ = req("POST", "/api/v1/admin/plans", 
                    {"slug": "test_plan", "name": "Test Plan", "price_monthly": 10, "message_limit": 50, "recipient_limit": 50}, admin_token)
    record("Aynı slug ile plan oluşturma (409)", "admin-plans", "Backend Ajani", status == 409)
    
    # GET plans
    status, data = req("GET", "/api/v1/admin/plans", None, admin_token)
    record("Plan listesi (200)", "admin-plans", "Backend Ajani", status == 200 and len(data.get("plans", [])) >= 3)
    
    # DELETE plan
    # create unused
    req("POST", "/api/v1/admin/plans", 
        {"slug": "unused_plan", "name": "Unused Plan", "price_monthly": 0, "message_limit": 5, "recipient_limit": 5}, admin_token)
    
    status, data = req("GET", "/api/v1/admin/plans", None, admin_token)
    unused_id = next(p["id"] for p in data["plans"] if p["slug"] == "unused_plan")
    
    status, _ = req("DELETE", f"/api/v1/admin/plans/{unused_id}", None, admin_token)
    record("Kullanılmayan plan silme (200)", "admin-plans", "Backend Ajani", status == 200)
    
    # Public pricing
    status, p = req("GET", "/api/v1/public/pricing")
    record("Public pricing endpoint", "public", "Backend Ajani", status == 200 and "plans" in (p or {}))
    
    # Admin fiyat değişikliği
    status, data = req("GET", "/api/v1/admin/plans", None, admin_token)
    free_plan = next(p for p in data["plans"] if p["slug"] == "free")
    
    status, _ = req("PUT", f"/api/v1/admin/plans/{free_plan['id']}", 
                    {**free_plan, "price_monthly": 10}, admin_token)
    
    status, p = req("GET", "/api/v1/public/pricing")
    updated_free = next(p for p in p["plans"] if p["slug"] == "free")
    
    record("Admin fiyat değişikliği public'e yansıyor", "public", "Backend Ajani",
           status == 200 and updated_free["price_monthly"] == 10)
    
    # --- END PLAN TESTLERİ ---

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

    # TestBulgulari_1 #3: telefonsuz kayıt 500 vermemeli (D1 undefined bind hatası)
    reg_email = f"smoke-reg-{int(time.time())}@test.dev"
    status, reg = req("POST", "/api/v1/auth/register",
                      {"email": reg_email, "password": "Test1234!",
                       "first_name": "Smoke", "last_name": "Kayıt"})
    record("Kayıt telefonsuz çalışıyor (D1 null bind)", "auth", "Backend Ajani",
           status == 201, f"status={status} body={reg}")

    # E-posta doğrulama kodunda süre kontrolü: bilinen hash'i enjekte et,
    # süresi GEÇMİŞ → 401; süre uzatılınca aynı kod → 200 (recipients OTP deseni)
    ver_hash = base64.b64encode(hashlib.sha256(b"123456").digest()).decode()
    ver_where = f"user_id = (SELECT id FROM users WHERE email='{reg_email}')"
    wrangler_cmd(["d1", "execute", "vasi-db", "--local", "--command",
                  f"UPDATE email_verifications SET code_hash='{ver_hash}', "
                  f"expires_at=datetime('now','-1 minute') WHERE {ver_where}"])
    status, exp_resp = req("POST", "/api/v1/auth/verify-email", {"email": reg_email, "otp": "123456"})
    record("Süresi geçmiş doğrulama kodu 401 dönüyor", "auth", "Backend Ajani",
           status == 401, f"status={status} body={exp_resp}")

    wrangler_cmd(["d1", "execute", "vasi-db", "--local", "--command",
                  f"UPDATE email_verifications SET expires_at=datetime('now','+10 minutes') WHERE {ver_where}"])
    status, ver_ok = req("POST", "/api/v1/auth/verify-email", {"email": reg_email, "otp": "123456"})
    record("Geçerli doğrulama kodu kabul ediliyor", "auth", "Backend Ajani",
           status == 200, f"status={status} body={ver_ok}")

    # TestBulgulari_1 #3: eksik alanla kayıt 400 dönmeli (500 değil)
    status, reg_bad = req("POST", "/api/v1/auth/register", {"email": "eksik@test.dev"})
    record("Eksik alanla kayıt 400 dönüyor", "auth", "Backend Ajani",
           status == 400 and (reg_bad or {}).get("code") == "VALIDATION_ERROR",
           f"status={status} body={reg_bad}")

    # TestBulgulari_1 #4/#7: silinen mesaj listeden düşmeli
    status, delmsg = req("POST", "/api/v1/messages",
                         {"title": "Silinecek mesaj", "message_type": "text", "content_text": "sil"}, token)
    del_id = (delmsg or {}).get("id")
    if del_id:
        req("DELETE", f"/api/v1/messages/{del_id}", None, token)
        status, lst2 = req("GET", "/api/v1/messages", None, token)
        gone = isinstance(lst2, list) and all(m.get("id") != del_id for m in lst2)
        record("Silinen mesaj listede görünmüyor", "messages", "Backend Ajani",
               status == 200 and gone, f"status={status} silinen={del_id}")

    # Admin login (is_admin setup main() içinde yapıldı)
    status, adm = req("POST", "/api/v1/admin/auth/login", {"email": TEST_EMAIL, "password": TEST_PASS})
    admin_token = (adm or {}).get("accessToken", "")
    record("Admin login", "admin", "Backend Ajani",
           status == 200 and bool(admin_token), f"status={status} body={adm}")
    if not admin_token:
        return

    # SPRINT 20: Kullanıcı askıya alma testi (Admin status change)
    status, users_list = req("GET", "/api/v1/admin/users", None, admin_token)
    user_id = users_list["users"][0]["id"]
    
    status, res = req("PATCH", f"/api/v1/admin/users/{user_id}/status", {"status": "suspended"}, admin_token)
    record("Admin kullanıcı askıya alma 200 dönüyor", "admin", "Backend Ajani", status == 200, f"status={status}")

    check = wrangler_cmd(["d1", "execute", "vasi-db", "--local", "--json", "--command", 
                          f"SELECT status FROM users WHERE id='{user_id}'"])
    audit = wrangler_cmd(["d1", "execute", "vasi-db", "--local", "--json", "--command",
                          f"SELECT action FROM audit_logs WHERE entity_id='{user_id}' AND action='admin_status_change_suspended'"])
    
    # JSON ayrıştırarak kontrol et (boşluklara karşı dirençli)
    status_ok = False
    audit_ok = False
    try:
        check_rows = json.loads(check.stdout)
        status_ok = check_rows[0]["results"][0]["status"] == "suspended"
        
        audit_rows = json.loads(audit.stdout)
        audit_ok = len(audit_rows[0]["results"]) > 0 and audit_rows[0]["results"][0]["action"] == "admin_status_change_suspended"
    except Exception as e:
        print(f"JSON parsing error: {e}")

    record("Admin kullanıcı askıya alma DB ve audit güncellendi", "admin", "Backend Ajani", 
           status_ok and audit_ok, f"status_ok={status_ok} audit_ok={audit_ok}")

    # Reset status
    req("PATCH", f"/api/v1/admin/users/{user_id}/status", {"status": "active"}, admin_token)



    # İstatistikler
    status, ov = req("GET", "/api/v1/admin/stats/overview", None, admin_token)
    record("Admin stats/overview", "admin", "Backend Ajani",
           status == 200 and (ov or {}).get("total_users", 0) >= 3, f"status={status} body={ov}")

    # Ayar güncelleme (admin_settings endpoint hâlâ mevcut)
    status, _ = req("PUT", "/api/v1/admin/settings", {"key": "plan_limit_free", "value": "1"}, admin_token)
    record("Admin ayar güncelleme", "admin", "Backend Ajani", status == 200, f"status={status}")

    # Limit zorlaması — S21: limit artık plans.message_limit'ten okunuyor (admin_settings değil)
    status, _plans = req("GET", "/api/v1/admin/plans", None, admin_token)
    _free = next(p for p in _plans["plans"] if p["slug"] == "free")
    req("PUT", f"/api/v1/admin/plans/{_free['id']}", {**_free, "message_limit": 0}, admin_token)
    status, lim = req("POST", "/api/v1/messages",
                      {"title": "Limit testi", "message_type": "text", "content_text": "limit"}, token)
    record("Plan limiti uygulanıyor (403 LIMIT_REACHED)", "messages", "Backend Ajani",
           status == 403 and (lim or {}).get("code") == "LIMIT_REACHED", f"status={status} body={lim}")
    req("PUT", f"/api/v1/admin/plans/{_free['id']}", {**_free, "message_limit": 10}, admin_token)

    # Gelir raporu
    status, rev = req("GET", "/api/v1/admin/reports/revenue", None, admin_token)
    record("Admin gelir raporu", "admin", "Backend Ajani",
           status == 200 and "total_monthly_revenue" in (rev or {}), f"status={status}")

    # (Eski {pricing:{...}} şekilli public-pricing testleri kaldırıldı — S21 yeni
    #  {plans:[...]} kontratı PLAN CRUD bloğunda test ediliyor.)

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

    # Sprint 19 (OTP): public önizleme içerik DÖNMEZ, otp_required işaretler
    if token_val:
        status, view = req("GET", f"/api/v1/public/view/{token_val}")
        record("Public önizleme içerik içermiyor (OTP gerekli)", "public", "Backend Ajani",
               status == 200 and "content_text" not in (view or {})
               and (view or {}).get("otp_required") is True and "sender_name" in (view or {}),
               f"status={status} body={view}")

        # OTP isteği: test alıcısı sahte olduğundan e-posta 502 verebilir —
        # önemli olan kodun DB'ye hash olarak yazılması.
        status, _otp_resp = req("POST", f"/api/v1/public/view/{token_val}/otp", {})
        otp_q = wrangler_cmd(["d1", "execute", "vasi-db", "--local", "--json", "--command",
                              f"SELECT otp_code FROM recipients WHERE access_token = '{token_val}'"])
        otp_stored = bool(re.search(r'"otp_code":\s*"[A-Za-z0-9+/=]+"', otp_q.stdout))
        record("OTP isteği kodu DB'ye yazıyor", "public", "Backend Ajani",
               status in (200, 502) and otp_stored, f"status={status} d1={otp_q.stdout[-150:]}")

        # Bilinen OTP hash'ini elle yaz → verify akışı deterministik test edilir
        known_otp = "123456"
        known_hash = base64.b64encode(hashlib.sha256(known_otp.encode()).digest()).decode()
        wrangler_cmd(["d1", "execute", "vasi-db", "--local", "--command",
                      f"UPDATE recipients SET otp_code='{known_hash}', "
                      f"otp_expires_at=datetime('now','+10 minutes'), otp_attempts=0 "
                      f"WHERE access_token='{token_val}'"])

        status, wrong = req("POST", f"/api/v1/public/view/{token_val}/verify", {"otp": "000000"})
        record("Yanlış OTP 401 + deneme sayacı", "public", "Backend Ajani",
               status == 401 and (wrong or {}).get("code") == "INVALID_OTP"
               and (wrong or {}).get("remaining_attempts") == 4,
               f"status={status} body={wrong}")

        status, good = req("POST", f"/api/v1/public/view/{token_val}/verify", {"otp": known_otp})
        record("Doğru OTP mesaj içeriğini dönüyor", "public", "Backend Ajani",
               status == 200 and "content_text" in (good or {}),
               f"status={status} body={str(good)[:150]}")

        status, replay = req("POST", f"/api/v1/public/view/{token_val}/verify", {"otp": known_otp})
        record("OTP tek kullanımlık (replay 400)", "public", "Backend Ajani",
               status == 400 and (replay or {}).get("code") == "OTP_NOT_REQUESTED",
               f"status={status} body={replay}")
    status, bad = req("GET", "/api/v1/public/view/gecersiztokendeneme1234567890abcdef")
    record("Geçersiz token 404 dönüyor", "public", "Backend Ajani",
           status == 404, f"status={status}")

    # Failed-Deliveries Retry Testleri (3 smoke testi)
    # 1. Olmayan id -> 404 NOT_FOUND
    status, retry_404 = req("POST", "/api/v1/admin/delivery/retry/olmayan-id-123456", {}, admin_token)
    record("Yeniden deneme olmayan id 404 dönüyor", "delivery", "Backend Ajani",
           status == 404 and (retry_404 or {}).get("code") == "NOT_FOUND", f"status={status} body={retry_404}")

    # 2. non-error status -> 409 INVALID_STATUS
    status, temp_msg = req("POST", "/api/v1/messages",
                           {"title": "Retry Non-Error Test", "message_type": "text", "content_text": "draft"}, token)
    temp_id = (temp_msg or {}).get("id")
    if temp_id:
        status, retry_409 = req("POST", f"/api/v1/admin/delivery/retry/{temp_id}", {}, admin_token)
        record("Yeniden deneme error olmayan status 409 dönüyor", "delivery", "Backend Ajani",
               status == 409 and (retry_409 or {}).get("code") == "INVALID_STATUS", f"status={status} body={retry_409}")

        # 3. error -> retry -> 200 + scheduled
        wrangler_cmd(["d1", "execute", "vasi-db", "--local", "--command",
                      f"UPDATE messages SET status='error', failed_reason='Some error' WHERE id='{temp_id}'"])
        status, retry_200 = req("POST", f"/api/v1/admin/delivery/retry/{temp_id}", {}, admin_token)

        db_res = wrangler_cmd(["d1", "execute", "vasi-db", "--local", "--json", "--command",
                               f"SELECT status, scheduled_at, failed_reason FROM messages WHERE id='{temp_id}'"])

        try:
            start_idx = db_res.stdout.find('[')
            end_idx = db_res.stdout.rfind(']') + 1
            rows = json.loads(db_res.stdout[start_idx:end_idx])
            results_list = rows[0].get("results", [])
            db_status = results_list[0].get("status")
            db_failed_reason = results_list[0].get("failed_reason")
            scheduled_at = results_list[0].get("scheduled_at")
        except Exception as e:
            db_status = f"JSON Error: {e}"
            db_failed_reason = "error"
            scheduled_at = None

        success = (status == 200 and db_status == "scheduled" and db_failed_reason is None and scheduled_at is not None)
        record("Yeniden deneme error'dan scheduled'a dönüştürüyor", "delivery", "Backend Ajani",
               success, f"status={status} db_status={db_status} db_failed_reason={db_failed_reason} scheduled_at={scheduled_at}")


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
