#!/usr/bin/env python3
"""Verify the public loader uses the same readable module list staged by Pages."""
from __future__ import annotations
import argparse,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
LOADER=ROOT/'public'/'app.js';MODULE_DIR=ROOT/'src'/'app'
EXPECTED=['01-core.js', '02-records.js', '02a-density.js', '02b-ecology-a.js', '02b-ecology-b.js', '02b-ecology-c.js', '02b-ecology-d.js', '02c-continuity.js', '02d-assets.js', '02e-assurance.js', '02f-release-candidate.js', '02g-world-completion.js', '02g0-world-reference-corrections.js', '02h-systems-evidence.js', '02i-systems-reference-corrections.js', '03-interface.js']
def main()->int:
 p=argparse.ArgumentParser();p.add_argument('--check',action='store_true');args=p.parse_args()
 loader=LOADER.read_text(encoding='utf-8');match=re.search(r"const modules=\[(.*?)\];",loader,re.S)
 listed=re.findall(r"'([^']+\.js)'",match.group(1)) if match else []
 missing=[name for name in EXPECTED if not (MODULE_DIR/name).is_file()]
 parallel='Promise.all(modules.map' in loader
 if listed!=EXPECTED or missing or not parallel: raise SystemExit(f'ERROR: public loader mismatch; listed={listed}, missing={missing}, parallel={parallel}')
 if args.check: print(f'GAIA public loader synchronized ({len(EXPECTED)} readable modules, ordered parallel loading)')
 return 0
if __name__=='__main__': raise SystemExit(main())
