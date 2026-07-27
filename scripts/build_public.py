#!/usr/bin/env python3
"""Build the compact public JavaScript bundle from readable source."""
from __future__ import annotations

import argparse
import base64
import gzip
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "src" / "app"
OUTPUT = ROOT / "public" / "app.js"


def build(source: str) -> str:
    compressed = gzip.compress(source.encode("utf-8"), compresslevel=9, mtime=0)
    encoded = base64.b64encode(compressed).decode("ascii")
    return (
        '(()=>{const b=atob("'
        + encoded
        + '"),u=Uint8Array.from(b,c=>c.charCodeAt(0));'
        + "new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip')))"
        + ".text().then(code=>(0,eval)(code));})();\n"
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Fail if public/app.js is not current")
    args = parser.parse_args()
    source = "".join(path.read_text(encoding="utf-8") for path in sorted(SOURCE_DIR.glob("*.js")))
    expected = build(source)
    if args.check:
        actual = OUTPUT.read_text(encoding="utf-8") if OUTPUT.exists() else ""
        if actual != expected:
            raise SystemExit("ERROR: public/app.js is not synchronized with src/app/*.js")
        print("GAIA public JavaScript bundle is synchronized")
        return 0
    OUTPUT.write_text(expected, encoding="utf-8")
    print(f"Built {OUTPUT.relative_to(ROOT)} from {len(list(SOURCE_DIR.glob('*.js')))} source modules")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
