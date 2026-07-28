#!/usr/bin/env python3
"""Verify the public loader uses the same readable module list staged by Pages."""
from __future__ import annotations
import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOADER = ROOT / "public" / "app.js"
MODULE_DIR = ROOT / "src" / "app"
EXPECTED = ["01-core.js", "02-records.js", "02a-density.js", "03-interface.js"]

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    loader = LOADER.read_text(encoding="utf-8")
    match = re.search(r"const modules=\[(.*?)\];", loader, re.S)
    listed = re.findall(r"'([^']+\.js)'", match.group(1)) if match else []
    missing = [name for name in EXPECTED if not (MODULE_DIR / name).is_file()]
    if listed != EXPECTED or missing:
        raise SystemExit(f"ERROR: public loader mismatch; listed={listed}, missing={missing}")
    if args.check:
        print(f"GAIA public loader synchronized ({len(EXPECTED)} readable modules)")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
