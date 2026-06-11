"""
Vasi App — smolagents Multi-Agent Geliştirme Ekibi
===================================================
CLI ile çalıştırma:
  python crew.py --sprint 1

Manager arayüzü:
  chainlit run manager.py

Gereksinim:
  Ollama çalışıyor olmalı: ollama run qwen2.5-coder:32b
"""

import argparse
import json
import os
import re as _re
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path

from smolagents import CodeAgent, LiteLLMModel, tool

# ── Ayarlar ──────────────────────────────────────────────────────────────────
ROOT            = Path(__file__).parent.parent
OLLAMA_BASE_URL = "http://localhost:11434"
LOG_FILE        = Path(__file__).parent / "sprint.log"

MODEL        = "qwen2.5-coder:32b"  # varsayılan (geriye dönük uyumluluk)
MODEL_STRONG = "qwen2.5-coder:32b"  # karmaşık görevler
MODEL_FAST   = "qwen2.5-coder:7b"   # basit görevler

# ── Modeller (TensorPM pattern) ───────────────────────────────────────────────
llm_strong = LiteLLMModel(
    model_id=f"ollama/{MODEL_STRONG}",
    api_base=OLLAMA_BASE_URL,
    temperature=0.1,
)

# 7b yoksa 32b'ye düş — Ollama'da kontrol et
def _check_model_available(model_name: str) -> bool:
    try:
        r = subprocess.run(
            f"ollama list", shell=True, capture_output=True, text=True, timeout=5
        )
        return model_name in r.stdout
    except Exception:
        return False

if _check_model_available(MODEL_FAST):
    llm_fast = LiteLLMModel(
        model_id=f"ollama/{MODEL_FAST}",
        api_base=OLLAMA_BASE_URL,
        temperature=0.1,
    )
else:
    print(f"⚠ {MODEL_FAST} bulunamadı — {MODEL_STRONG} kullanılıyor")
    llm_fast = llm_strong

llm = llm_strong  # geriye dönük uyumluluk

# ── local-llm-router ──────────────────────────────────────────────────────────
# Karmaşık görev anahtar kelimeleri → 32b modele yönlendir
_COMPLEX_KEYWORDS = [
    "tasarla", "yeniden yaz", "entegre", "mimari", "auth", "ödeme", "iyzico",
    "migration", "schema", "refactor", "komple", "tüm sayfa", "dashboard",
    "wizard", "implement", "yeni sayfa", "oluştur", "geliştir", "sprint",
    "full page", "complete", "build", "akış", "flow",
]

def _route_model(description: str) -> LiteLLMModel:
    """Görev karmaşıklığına göre llm_strong veya llm_fast döner."""
    desc_lower = description.lower()
    if any(kw in desc_lower for kw in _COMPLEX_KEYWORDS):
        return llm_strong
    return llm_fast


# ── Tools ─────────────────────────────────────────────────────────────────────

@tool
def bash(command: str) -> str:
    """Proje root dizininde shell komutu çalıştırır. Build, test, sqlite doğrulama için kullan.

    Args:
        command: Çalıştırılacak shell komutu (örn: 'ls migrations/', 'pnpm build')
    """
    result = subprocess.run(
        command, shell=True, cwd=str(ROOT),
        capture_output=True, text=True, timeout=120
    )
    out = (result.stdout + result.stderr).strip()
    return f"{out}\n---exit:{result.returncode}---" if out else f"---exit:{result.returncode}---"


_CODE_EXTS = {".ts", ".tsx", ".js", ".jsx"}

def _sanitize_code(path: str, content: str) -> str:
    """Ajan bazen TÜM backtick'leri escape ediyor (\\` → TS sözdizimi bozulur).
    Heuristik: dosyada düz backtick hiç yok ama escape'li varsa, hepsini geri çevir.
    (Sprint 6 ve 7'de build'i art arda bozan hatanın kalıcı çözümü.)
    """
    if Path(path).suffix in _CODE_EXTS and "\\`" in content:
        if "`" not in content.replace("\\`", ""):
            return content.replace("\\`", "`")
    return content


@tool
def write_file(path: str, content: str) -> str:
    """Dosya oluşturur veya üzerine yazar. Klasörler otomatik oluşturulur.

    Args:
        path: Proje root'a göre dosya yolu (örn: 'vasi-api/src/lib/jwt.ts')
        content: Dosyanın tam içeriği
    """
    full = ROOT / path
    full.parent.mkdir(parents=True, exist_ok=True)
    fixed = _sanitize_code(path, content)
    note = " [backtick escape düzeltildi]" if fixed != content else ""
    full.write_text(fixed, encoding="utf-8")
    return f"Yazildi: {path} ({len(fixed)} karakter){note}"


@tool
def read_file(path: str) -> str:
    """Dosya içeriğini okur.

    Args:
        path: Proje root'a göre dosya yolu
    """
    full = ROOT / path
    if not full.exists():
        return f"[Dosya bulunamadı: {path}]"
    return full.read_text(encoding="utf-8")


@tool
def list_dir(path: str) -> str:
    """Klasör içeriğini (dosya ve alt klasörleri) listeler.

    Args:
        path: Proje root'a göre klasör yolu (örn: 'migrations', 'vasi-api/src')
    """
    full = ROOT / path
    if not full.exists():
        return f"[Klasör bulunamadı: {path}]"
    lines = []
    for item in sorted(full.rglob("*")):
        rel = item.relative_to(ROOT)
        prefix = "DIR" if item.is_dir() else "FILE"
        lines.append(f"{prefix} {rel}")
    return "\n".join(lines) if lines else "[Boş klasör]"


@tool
def git_commit(message: str) -> str:
    """Tüm değişiklikleri git'e ekler ve commit atar.

    Args:
        message: Commit mesajı (örn: 'feat(sprint-1): db seed data')
    """
    r1 = subprocess.run("git add -A", shell=True, cwd=str(ROOT), capture_output=True, text=True)
    r2 = subprocess.run(
        f'git commit -m "{message}"',
        shell=True, cwd=str(ROOT), capture_output=True, text=True
    )
    out = (r1.stdout + r1.stderr + r2.stdout + r2.stderr).strip()
    return out or "Commit tamamlandı."


@tool
def check_css() -> str:
    """TSX dosyalarını UX/UI kural ihlalleri için tarar.
    Kırık Tailwind renk class'ları (bg-Copper, text-Cream vb.) ve
    yanlış route prefix'lerini (/dashboard/messages/) raporlar.
    """
    violations = check_ux_rules()
    if not violations:
        return "✅ UX/UI kural ihlali yok."
    lines = [f"❌ {sum(len(v['violations']) for v in violations)} ihlal, {len(violations)} dosya:\n"]
    for item in violations:
        lines.append(f"\n{item['file']}:")
        lines.extend(item["violations"])
    return "\n".join(lines)


@tool
def run_tsc() -> str:
    """vasi-api ve vasi-web projelerinde TypeScript build kontrolü çalıştırır.
    Hata varsa tam hata mesajını, temizse ✅ döner.
    """
    results = check_builds()
    lines = []
    for proj, err in results.items():
        if err is None:
            lines.append(f"✅ {proj}: temiz")
        else:
            lines.append(f"❌ {proj}:\n{err[:800]}")
    return "\n".join(lines)


# ── Referans dosyaları ────────────────────────────────────────────────────────

def _read(path: str) -> str:
    full = ROOT / path
    return full.read_text(encoding="utf-8") if full.exists() else f"[Dosya bulunamadı: {path}]"


PRD        = _read("Vasi_PRD_v2.md")
ARCH       = _read("Vasi_Technical_Architecture.md")
MVP_SCOPE  = _read("Vasi_MVP_Scope.md")
WEB_RULES  = _read("vasi-web/CLAUDE.md")
API_RULES  = _read("vasi-api/CLAUDE.md")
DESIGN     = _read("DESIGN.md")

_mig_dir = ROOT / "migrations"
MIGRATIONS = "\n\n".join(
    (_mig_dir / f).read_text()
    for f in sorted(os.listdir(_mig_dir))
    if f.endswith(".sql")
) if _mig_dir.exists() else ""


# ── Agent bağlamları ──────────────────────────────────────────────────────────

AGENT_CONTEXT = {
    "DB Ajani": f"""\
Sen bir Cloudflare D1 (SQLite) veritabanı uzmanısın.
- Standart SQL kullanırsın, D1'e özgü özelliklerden kaçınırsın.
- Proje kök dizini: {ROOT}

Proje mimarisi (özet):
{ARCH[:1500]}

Mevcut migration'lar:
{MIGRATIONS[:3000]}
""",

    "Backend Ajani": f"""\
Sen Cloudflare Workers ve Hono framework uzmanısın.
- TypeScript strict mode kullanırsın.
- Node.js built-in'lerini ASLA kullanmazsın (Web Crypto API, fetch vb. kullanırsın).
- Proje kök dizini: {ROOT}

API geliştirme kuralları:
{API_RULES[:3000]}

Veritabanı şeması:
{MIGRATIONS[:2000]}
""",

    "Web Ajani": f"""\
Sen Next.js 15 ve Cloudflare Pages uzmanısın.
- Her sayfada export const runtime = 'edge' ZORUNLU.
- Hiçbir metni hardcode yazmaz, LANGS objesinde tutarsın.
- RTL (Arapça) desteğini her yeni sayfada sağlarsın.
- Marka renkleri: Obsidian #0C1525, Copper #D4763B, Cream #EDE9E0
- Proje kök dizini: {ROOT}

Web geliştirme kuralları:
{WEB_RULES[:3000]}
""",

    "UX/UI Ajani": f"""\
Sen Vasi uygulamasının baş UX/UI tasarımcısı ve frontend geliştiricisisin.
Hem tasarım kararları verirsin hem de React/Next.js ile uygularsın.
Proje kök dizini: {ROOT}

## Ürün Bağlamı
Vasi, insanların geleceğe mesaj bırakmasını sağlayan duygusal bir platform.
Kullanıcılar sevdiklerine yıllar sonra ulaşacak mesajlar yazıyor.
Ton: güvende, sıcak, anlamlı. Soğuk veya kurumsal hissettirme.

## Tasarım Sistemi (DESIGN.md)
{DESIGN}

## Teknik Kurallar
- Next.js 15 App Router, TypeScript strict
- Her sayfada: export const runtime = 'edge' ZORUNLU
- 'use client' — interaktif sayfalarda gerekli
- useRouter, useState, useEffect — Next.js/React standart hook'ları
- Çok dilli destek: metinleri LANGS objesi içinde tut (TR, EN minimum)
- RTL desteği: Arapça için dir="rtl"

Web geliştirme kuralları:
{WEB_RULES[:2000]}
""",
}


# ── Tester Ajani: deterministik smoke testler + sahibine düzelttirme ─────────
# Testlerin kendisi LLM DEĞİL — crew/tests/api_smoke.py deterministik koşar.
# Tester Ajani rolü: sonuçları okur, hataları sahibi olan ajana düzelttirir.

TEST_SCRIPT = Path(__file__).parent / "tests" / "api_smoke.py"


def run_smoke_tests() -> dict:
    """Smoke test paketini koşar. Returns: {passed, failed, failures:[...], raw}"""
    try:
        r = subprocess.run(
            [sys.executable, str(TEST_SCRIPT)],
            capture_output=True, text=True, timeout=420,
        )
        out = r.stdout + r.stderr
    except subprocess.TimeoutExpired:
        out = "TIMEOUT: test paketi 420 saniyede bitmedi"
    m = _re.search(r"RESULTS_JSON: (\{.*\})", out)
    if m:
        data = json.loads(m.group(1))
    else:
        data = {"passed": 0, "failed": -1, "failures": [
            {"name": "test paketi çöktü", "area": "infra", "owner": "Backend Ajani",
             "ok": False, "detail": out[-400:]}]}
    data["raw"] = out
    return data


def run_test_cycle(sprint_n: int = 0) -> str:
    """Tester Ajani döngüsü: test → hata varsa sahibine düzelttir → tekrar test.
    Returns: insan-okur özet satırı."""
    label = f"sprint-{sprint_n}" if sprint_n else "manuel"
    _log(f"  [Tester Ajani] Smoke testler koşuluyor ({label})...")
    data = run_smoke_tests()

    if data["failed"] == 0:
        _log(f"  [Tester Ajani] ✓ {data['passed']}/{data['passed']} test geçti")
        return f"✅ Testler: {data['passed']}/{data['passed']} geçti"

    for attempt in (1, 2):
        failures = data["failures"]
        _log(f"  [Tester Ajani] ✗ {len(failures)} test başarısız (deneme {attempt}/2) — sahiplerine iletiliyor")
        for f in failures:
            _log(f"    ✗ [{f.get('area', '?')}] {f.get('name', '?')}")

        by_owner: dict[str, list[dict]] = {}
        for f in failures:
            by_owner.setdefault(f.get("owner", "Backend Ajani"), []).append(f)

        for owner, fails in by_owner.items():
            detail = "\n\n".join(
                f"### {f['name']} [{f['area']}]\n{f['detail']}" for f in fails
            )
            _log(f"  [Tester Ajani] → {owner}: {len(fails)} bulgu")
            fix_prompt = (
                f"Sen {owner} olarak çalışıyorsun. Tester Ajani şu testlerin "
                f"BAŞARISIZ olduğunu raporladı. İlgili kaynak dosyaları oku, kök nedeni "
                f"düzelt. Test dosyasına ({TEST_SCRIPT.name}) DOKUNMA — testler doğru, kod hatalı.\n"
                f"YASAK: sqlite3 ile .wrangler altındaki veritabanlarına doğrudan ALTER/UPDATE yapma — "
                f"testler her koşuda migrations/ klasöründen temiz DB kurar, elle değişiklik İŞE YARAMAZ. "
                f"Şema değişikliği gerekiyorsa migrations/ altına YENİ numaralı .sql dosyası ekle; "
                f"ya da kodu şemaya uydur.\n\n"
                f"## Başarısız Testler\n{detail}\n\n"
                f"## Bağlam\n{AGENT_CONTEXT.get(owner, '')[:1500]}\n\n"
                f"Düzeltince run_tsc() ile build kontrolü yap. Temizse:\n"
                f'git_commit("fix({label}): tester bulgusu düzeltildi — {fails[0]["area"]}")\n'
            )
            fix_agent = CodeAgent(
                tools=[bash, write_file, read_file, list_dir, git_commit, run_tsc],
                model=llm_strong,
                max_steps=15,
                verbosity_level=1,
                additional_authorized_imports=["os", "pathlib", "subprocess", "re", "json"],
            )
            fix_agent.run(fix_prompt)

        data = run_smoke_tests()
        if data["failed"] == 0:
            _log(f"  [Tester Ajani] ✓ Düzeltme sonrası tüm testler geçti ({data['passed']})")
            return f"✅ Testler: {data['passed']} geçti (Tester {attempt}. denemede düzelttirdi)"

    names = ", ".join(f["name"] for f in data["failures"][:3])
    _log(f"  [Tester Ajani] ⚠ {data['failed']} test hâlâ kırık — manuel kontrol gerekli: {names}")
    return f"❌ Testler: {data['failed']} başarısız ({names}) — manuel kontrol gerekli"


# ── TaskSpec ─────────────────────────────────────────────────────────────────

class TaskSpec:
    """Sprint görev tanımı.

    parallel_group: Aynı int değerine sahip task'lar paralel çalışır.
                    None = diğer task'lardan bağımsız, sıralı çalışır.
    """
    def __init__(
        self,
        role: str,
        description: str,
        parallel_group: int | None = None,
    ):
        self.role = role
        self.description = description
        self.parallel_group = parallel_group


# ── Build doğrulama ───────────────────────────────────────────────────────────

BUILD_CHECKS = [
    ("vasi-api", ROOT / "vasi-api"),
    ("vasi-web", ROOT / "vasi-web"),
]

def check_builds() -> dict:
    """Her iki projenin TypeScript build durumunu döner.
    Returns: {"vasi-api": None, "vasi-web": "hata mesajı"} — None = temiz
    """
    results = {}
    for name, cwd in BUILD_CHECKS:
        tsc = cwd / "node_modules" / ".bin" / "tsc"
        r = subprocess.run(
            f'"{tsc}" --noEmit',
            shell=True, cwd=str(cwd), capture_output=True, text=True
        )
        errors = (r.stdout + r.stderr).strip()
        if r.returncode != 0 and errors and "Compiles the current project" not in errors:
            results[name] = errors
        else:
            results[name] = None
    return results


# ── UX/UI kural doğrulama ─────────────────────────────────────────────────────

_BROKEN_TAILWIND = _re.compile(
    r'(?:^|[\s"\'`])(?:bg|text|border|ring|hover:bg|hover:text|hover:border|focus:ring|focus:border)-'
    r'(?:Copper|Cream|Obsidian|Midnight|Horizon|Mist|Offwhite|D46B30|B55C22)[^\w]',
    _re.MULTILINE,
)

_WRONG_ROUTE = _re.compile(r'''['"]/dashboard/messages/''')

def check_ux_rules() -> list[dict]:
    """TSX dosyalarını UX/UI kural ihlalleri için tarar.
    Returns: [{"file": "...", "violations": ["satır: ..."]}]
    """
    web_src = ROOT / "vasi-web" / "src"
    violations = []

    for tsx in sorted(web_src.rglob("*.tsx")):
        rel = tsx.relative_to(ROOT)
        if str(rel) == "vasi-web/src/app/page.tsx":
            continue

        content = tsx.read_text(encoding="utf-8")
        file_violations = []

        for lineno, line in enumerate(content.splitlines(), 1):
            if _BROKEN_TAILWIND.search(line):
                file_violations.append(f"  L{lineno} BROKEN_TAILWIND: {line.strip()[:120]}")
            if _WRONG_ROUTE.search(line):
                file_violations.append(f"  L{lineno} WRONG_ROUTE: {line.strip()[:120]}")

        if file_violations:
            violations.append({"file": str(rel), "violations": file_violations})

    return violations


# ── Agent çalıştırıcı ─────────────────────────────────────────────────────────

MAX_FIX_ATTEMPTS = 3

def run_task(task: "TaskSpec", sprint_n: int) -> tuple[str, float]:
    """Görevi çalıştırır, build + UX/UI kurallarını otomatik düzeltir.
    Returns: (result_summary, elapsed_seconds)
    """
    t_start = time.time()
    model = _route_model(task.description)
    model_name = MODEL_STRONG if model is llm_strong else MODEL_FAST
    _log(f"  → Model seçildi: {model_name} ({task.role})")

    if len(task.description) > 4000:
        _log(
            f"  ⚠ Görev açıklaması uzun ({len(task.description)} karakter) — "
            f"context taşması riski. Kısalt, detay için DESIGN.md/dosya referansı ver."
        )

    context = AGENT_CONTEXT.get(task.role, "")

    prompt = (
        f"Sen {task.role} olarak çalışıyorsun. Sprint {sprint_n} görevindesin.\n\n"
        f"## Rol ve Bağlam\n{context}\n\n"
        f"## Görev\n{task.description}\n\n"
        f"## ZORUNLU SON ADIMLAR\n"
        f"Tüm dosyaları yazdıktan ve build/doğrulama başarılı olduktan sonra:\n"
        f'git_commit("feat(sprint-{sprint_n}): {task.role.lower()} done")\n\n'
        f"Eğer build veya SQL doğrulaması hata verirse, hatayı düzelt ve tekrar çalıştır.\n"
        f"Başarılı olmadan commit ATMA.\n"
    )

    # UX görevleri uzun açıklamalarla context'i hızlı dolduruyor → daha az adım
    max_steps = 20 if task.role == "UX/UI Ajani" else 30

    agent = CodeAgent(
        tools=[bash, write_file, read_file, list_dir, git_commit, check_css, run_tsc],
        model=model,
        max_steps=max_steps,
        verbosity_level=1,
        additional_authorized_imports=["os", "pathlib", "subprocess", "re", "json"],
    )

    result = str(agent.run(prompt))

    # Adım limiti doldu mu? (Sprint 7'de Task 3 sessizce yarım kalmıştı)
    steps_used = len(getattr(getattr(agent, "memory", None), "steps", []) or [])
    if steps_used >= max_steps:
        _log(
            f"  ⚠ ADIM LİMİTİ DOLDU ({steps_used}/{max_steps}) — "
            f"görev yarım kalmış olabilir, çıktıyı manuel kontrol et ({task.role})"
        )

    # ── Build doğrulama döngüsü ───────────────────────────────────────────────
    for attempt in range(1, MAX_FIX_ATTEMPTS + 1):
        build_results = check_builds()
        failing = {k: v for k, v in build_results.items() if v is not None}

        if not failing:
            _log(f"  ✓ Build temiz ({task.role})")
            break

        _log(f"  ✗ Build hataları (deneme {attempt}/{MAX_FIX_ATTEMPTS}) — düzeltiliyor...")
        for proj, errors in failing.items():
            _log(f"    {proj}: {errors[:200]}")

        error_summary = "\n\n".join(
            f"### {proj} TypeScript hataları:\n```\n{errors}\n```"
            for proj, errors in failing.items()
        )

        fix_prompt = (
            f"Sen {task.role} olarak çalışıyorsun.\n\n"
            f"Aşağıdaki TypeScript build hataları var. SADECE bu hataları düzelt.\n\n"
            f"{error_summary}\n\n"
            f"Düzelttikten sonra: run_tsc() ile kontrol et.\n"
            f"Build temiz olunca:\n"
            f'git_commit("fix(sprint-{sprint_n}): build hataları düzeltildi (deneme {attempt})")\n'
        )

        fix_agent = CodeAgent(
            tools=[bash, write_file, read_file, list_dir, git_commit, run_tsc],
            model=llm_fast,  # build fix için fast model yeterli
            max_steps=20,
            verbosity_level=1,
            additional_authorized_imports=["os", "pathlib", "subprocess", "re", "json"],
        )
        fix_agent.run(fix_prompt)
    else:
        _log(f"  ⚠ Build {MAX_FIX_ATTEMPTS} denemede düzeltilemedi — manuel kontrol gerekli")

    # ── UX/UI kural doğrulama döngüsü (sadece UX/UI görevi ise) ─────────────
    if task.role == "UX/UI Ajani":
        for attempt in range(1, MAX_FIX_ATTEMPTS + 1):
            ux_violations = check_ux_rules()

            if not ux_violations:
                _log(f"  ✓ UX/UI kuralları temiz ({task.role})")
                break

            total = sum(len(v["violations"]) for v in ux_violations)
            _log(f"  ✗ UX/UI kural ihlali: {total} satır, {len(ux_violations)} dosya (deneme {attempt}/{MAX_FIX_ATTEMPTS})")

            violation_detail = "\n\n".join(
                f"### {item['file']}\n" + "\n".join(item["violations"])
                for item in ux_violations
            )

            ux_fix_prompt = f"""\
Sen UX/UI Ajani olarak çalışıyorsun.

Aşağıdaki TSX dosyalarında design system kural ihlalleri var.
SADECE bu ihlalleri düzelt, başka değişiklik yapma.

## İhlal Türleri

### BROKEN_TAILWIND
`bg-Copper`, `text-Cream`, `bg-Midnight`, `border-Horizon` gibi Tailwind custom renk class'ları
ÇALIŞMIYOR çünkü tailwind.config.ts'de tanımlı değil.
**Düzeltme:** Inline `style={{}}` ile CSS değişkeni kullan.
Örnekler:
- `className="... text-Cream ..."` → `style={{color: 'var(--cream)'}}`
- `className="... bg-Copper ..."` → `style={{background: 'var(--copper)'}}`
- `className="... border-Horizon ..."` → `style={{border: '1px solid var(--horizon)'}}`
- `className="... bg-Midnight ..."` → `style={{background: 'var(--midnight)'}}`

### WRONG_ROUTE
`/dashboard/messages/` prefix'i yanlış. Doğrusu `/messages/`.

## İhlaller

{violation_detail}

## Talimat
1. Her dosyayı `read_file` ile oku
2. Sadece ihlal eden satırları düzelt
3. Dosyayı `write_file` ile geri yaz
4. Tamamlayınca: check_css() ile doğrula
5. Temizse: git_commit("fix(sprint-{sprint_n}): UX kural ihlalleri düzeltildi (deneme {attempt})")
"""

            ux_fix_agent = CodeAgent(
                tools=[bash, write_file, read_file, list_dir, git_commit, check_css],
                model=llm_fast,
                max_steps=25,
                verbosity_level=1,
                additional_authorized_imports=["os", "pathlib", "subprocess", "re", "json"],
            )
            ux_fix_agent.run(ux_fix_prompt)
        else:
            _log(f"  ⚠ UX kural ihlalleri {MAX_FIX_ATTEMPTS} denemede düzeltilemedi — manuel kontrol gerekli")

    elapsed = time.time() - t_start
    return result, elapsed


# ── Sprint branch yönetimi ────────────────────────────────────────────────────

def create_sprint_branch(sprint_number: int) -> str:
    branch = f"sprint-{sprint_number}"
    r = subprocess.run(
        f"git checkout -b {branch}",
        shell=True, cwd=str(ROOT), capture_output=True, text=True
    )
    if r.returncode != 0:
        r2 = subprocess.run(
            f"git checkout {branch}",
            shell=True, cwd=str(ROOT), capture_output=True, text=True
        )
        if r2.returncode == 0:
            return f"Branch zaten mevcut, geçildi: {branch}"
        return f"Branch işlemi başarısız:\n{r.stderr}"
    return f"Branch oluşturuldu: {branch}"


# ── Sprint yükleyici ──────────────────────────────────────────────────────────

def load_sprint(sprint_number: int) -> list:
    sprint_file = Path(__file__).parent / f"sprint{sprint_number}.py"
    if not sprint_file.exists():
        raise FileNotFoundError(f"Sprint dosyası bulunamadı: {sprint_file}")

    namespace = {"TaskSpec": TaskSpec, "ROOT": ROOT}
    exec(sprint_file.read_text(encoding="utf-8"), namespace)
    tasks = namespace.get("tasks", [])
    if not tasks:
        raise ValueError(f"sprint{sprint_number}.py içinde 'tasks' listesi tanımlı değil.")
    return tasks


# ── Loglama ───────────────────────────────────────────────────────────────────

def _log(msg: str) -> None:
    entry = f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}"
    print(entry)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(entry + "\n")


# ── Sprint çalıştırıcı ────────────────────────────────────────────────────────

def run_sprint(sprint_number: int) -> dict:
    """Sprint'i çalıştırır.
    Returns: {
        "summary": str,
        "tasks": [{"role": str, "status": str, "elapsed": float}]
    }
    """
    _log("=" * 60)
    _log(f"Sprint {sprint_number} başlıyor — Güçlü: {MODEL_STRONG} / Hızlı: {MODEL_FAST}")
    _log(f"Root: {ROOT}")
    _log("=" * 60)

    branch_result = create_sprint_branch(sprint_number)
    _log(branch_result)

    tasks = load_sprint(sprint_number)
    task_results = []  # {"role", "status", "elapsed"}

    # Paralel grupları hesapla
    # parallel_group=None → kendi grubunda tek başına (sıralı), key = i
    # parallel_group=N (≥100 kullan) → aynı N'e sahip task'lar paralel çalışır
    groups: dict[int, list[tuple[int, TaskSpec]]] = {}
    for i, task in enumerate(tasks):
        g = task.parallel_group if task.parallel_group is not None else i
        groups.setdefault(g, []).append((i + 1, task))

    # Grupları artan sırayla çalıştır (0, 1, 2, ... → doğru sıra)
    sorted_group_keys = sorted(groups.keys())

    for g_key in sorted_group_keys:
        group = groups[g_key]

        if len(group) == 1:
            # Sıralı çalışma
            i, task = group[0]
            _log(f"Task {i}/{len(tasks)} başlıyor: {task.role}")
            try:
                result, elapsed = run_task(task, sprint_number)
                _log(f"Task {i} ({task.role}) tamamlandı — {elapsed:.0f}s")
                task_results.append({"role": task.role, "status": "OK", "elapsed": elapsed})
            except Exception as e:
                _log(f"Task {i} ({task.role}) hata: {e}")
                task_results.append({"role": task.role, "status": f"HATA: {e}", "elapsed": 0.0})
        else:
            # Paralel çalışma
            _log(f"Paralel grup {g_key}: {[t.role for _, t in group]} — aynı anda başlıyor")
            with ThreadPoolExecutor(max_workers=len(group)) as executor:
                futures = {
                    executor.submit(run_task, task, sprint_number): (i, task)
                    for i, task in group
                }
                for future in as_completed(futures):
                    i, task = futures[future]
                    try:
                        result, elapsed = future.result()
                        _log(f"Task {i} ({task.role}) tamamlandı — {elapsed:.0f}s")
                        task_results.append({"role": task.role, "status": "OK", "elapsed": elapsed})
                    except Exception as e:
                        _log(f"Task {i} ({task.role}) hata: {e}")
                        task_results.append({"role": task.role, "status": f"HATA: {e}", "elapsed": 0.0})

    # ── Tester Ajani: sprint sonrası smoke testler + otomatik düzelttirme ──
    try:
        test_summary = run_test_cycle(sprint_number)
    except Exception as e:
        test_summary = f"⚠ Tester çalıştırılamadı: {e}"
        _log(f"  [Tester Ajani] HATA: {e}")

    _log(f"Sprint {sprint_number} tamamlandı")
    _log("=" * 60)

    summary_lines = [
        f"{'OK' if r['status'] == 'OK' else '✗'} {r['role']} — {r['elapsed']:.0f}s"
        for r in task_results
    ]
    summary_lines.append(test_summary)

    return {
        "summary": "\n".join(summary_lines),
        "tasks": task_results,
        "tests": test_summary,
    }


# ── CLI ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Vasi smolagents Runner")
    parser.add_argument("--sprint", type=int, default=1)
    args = parser.parse_args()
    result = run_sprint(args.sprint)
    print(result["summary"])
