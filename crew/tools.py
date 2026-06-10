"""
Vasi CrewAI — Özel Araçlar
==========================
Git ve build araçları. Tüm komutlar proje root'unda çalışır.
"""

import subprocess
from pathlib import Path
from typing import Type

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

ROOT = Path(__file__).parent.parent


def _run(command: str, cwd: Path | None = None) -> tuple[int, str]:
    """Shell komutu çalıştırır; (returncode, combined_output) döner."""
    result = subprocess.run(
        command,
        shell=True,
        capture_output=True,
        text=True,
        cwd=str(cwd or ROOT),
    )
    parts = []
    if result.stdout.strip():
        parts.append(result.stdout.strip())
    if result.stderr.strip():
        parts.append(f"[stderr] {result.stderr.strip()}")
    return result.returncode, "\n".join(parts) or "(çıktı yok)"


# ── BashTool ─────────────────────────────────────────────────────────────────

class BashInput(BaseModel):
    command: str = Field(description="Çalıştırılacak shell komutu")


class BashTool(BaseTool):
    name: str = "bash"
    description: str = (
        "Proje root dizininde herhangi bir shell komutu çalıştırır. "
        "Dosya oluşturma/düzenleme, build çalıştırma, test etme için kullan. "
        "Çıktı: stdout + stderr + exit code."
    )
    args_schema: Type[BaseModel] = BashInput

    def _run(self, command: str) -> str:
        code, out = _run(command)
        return f"{out}\n[exit: {code}]"


# ── GitTool ──────────────────────────────────────────────────────────────────

class GitInput(BaseModel):
    operation: str = Field(
        description=(
            "Git işlemi: "
            "'branch <ad>' — branch oluştur/geç | "
            "'commit <mesaj>' — tüm değişiklikleri commit et | "
            "'status' — değişiklikleri göster | "
            "'log' — son 5 commit"
        )
    )


class GitTool(BaseTool):
    name: str = "git"
    description: str = (
        "Git repository işlemleri. "
        "Kullanım örnekleri: "
        "'branch sprint-1' | "
        "'commit feat(sprint-1): backend auth implementation' | "
        "'status' | 'log'"
    )
    args_schema: Type[BaseModel] = GitInput

    def _run(self, operation: str) -> str:
        op = operation.strip()

        if op.startswith("branch "):
            branch = op[7:].strip()
            code, out = _run(f"git checkout -b {branch}")
            if code != 0:
                code2, out2 = _run(f"git checkout {branch}")
                if code2 == 0:
                    return f"(branch zaten mevcut, geçildi: {branch})\n{out2}"
                return f"HATA: Branch işlemi başarısız.\n{out}"
            return f"Branch oluşturuldu ve geçildi: {branch}\n{out}"

        elif op.startswith("commit "):
            msg = op[7:].strip()
            _run("git add .")
            _, status = _run("git status --porcelain")
            if not status.strip():
                return "Commit atılacak değişiklik yok (working tree temiz)."
            code, out = _run(f'git commit -m "{msg}"')
            if code != 0:
                return f"HATA: Commit başarısız.\n{out}"
            return f"✅ Commit atıldı: {msg}\n{out}"

        elif op == "status":
            _, out = _run("git status --short")
            return out if out.strip() else "Working tree temiz."

        elif op == "log":
            _, out = _run("git log --oneline -5")
            return out

        else:
            code, out = _run(f"git {op}")
            return f"{out}\n[exit: {code}]"


# ── Yardımcı: sprint branch'i oluştur ───────────────────────────────────────

def create_sprint_branch(sprint_number: int) -> str:
    """Sprint başlangıcında git branch oluşturur. crew.py'den doğrudan çağrılır."""
    branch = f"sprint-{sprint_number}"
    code, out = _run(f"git checkout -b {branch}")
    if code != 0:
        code2, out2 = _run(f"git checkout {branch}")
        if code2 == 0:
            return f"✅ Branch zaten mevcut, geçildi: {branch}"
        return f"⚠️ Branch işlemi başarısız:\n{out}"
    return f"✅ Branch oluşturuldu: {branch}"
