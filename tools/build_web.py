"""
Build web (HTML5/WebGL) untuk itch.io.

Membuat dist/sinyal-web-v<versi>.zip berisi isi folder src/ dengan index.html di root zip.
Jalankan dari folder repo:  python tools/build_web.py
"""
import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
DIST = ROOT / "dist"
SKIP_NAMES = {".DS_Store", "Thumbs.db", ".gitkeep"}


def read_version() -> str:
    text = (SRC / "js" / "config.js").read_text(encoding="utf-8")
    m = re.search(r"version:\s*'([^']+)'", text)
    return m.group(1) if m else "dev"


def main() -> int:
    if not (SRC / "index.html").exists():
        print("src/index.html tidak ditemukan", file=sys.stderr)
        return 1
    DIST.mkdir(exist_ok=True)
    out = DIST / f"sinyal-web-v{read_version()}.zip"
    files = sorted(p for p in SRC.rglob("*") if p.is_file() and p.name not in SKIP_NAMES and p.suffix != ".md")
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for p in files:
            z.write(p, p.relative_to(SRC).as_posix())
    size_kb = out.stat().st_size / 1024
    print(f"OK  {out.relative_to(ROOT)}  ({len(files)} file, {size_kb:.1f} KB)")
    print("Upload zip ini ke itch.io dan centang 'This file will be played in the browser'.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
