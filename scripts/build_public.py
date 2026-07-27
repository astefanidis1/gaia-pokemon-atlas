#!/usr/bin/env python3
"""Build or verify the small public loader for readable GAIA source modules."""
from __future__ import annotations

import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "src" / "app"
OUTPUT = ROOT / "public" / "app.js"
MODULES = [path.name for path in sorted(SOURCE_DIR.glob("*.js"))]


def loader() -> str:
    module_json = ",".join(repr(name) for name in MODULES)
    return f"""(()=>{{
  const modules=[{module_json}];
  const roots=['source/','../src/app/'];
  (async()=>{{
    const parts=[];
    for(const name of modules){{
      let loaded=false;
      for(const root of roots){{
        try{{
          const response=await fetch(root+name,{{cache:'no-cache'}});
          if(response.ok){{parts.push(await response.text());loaded=true;break;}}
        }}catch{{}}
      }}
      if(!loaded) throw new Error(`Unable to load GAIA source module: ${{name}}`);
    }}
    (0,eval)(parts.join(''));
  }})().catch(error=>{{
    console.error(error);
    const loading=document.querySelector('#loading');
    if(loading) loading.innerHTML='<img src="assets/gaia-seal.svg" alt=""><strong>GAIA application link unavailable</strong><span>The readable public interface could not be verified. Reload to try again.</span>';
  }});
}})();
"""


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Fail if the public loader is not current")
    args = parser.parse_args()
    expected = loader()
    if args.check:
        actual = OUTPUT.read_text(encoding="utf-8") if OUTPUT.exists() else ""
        if actual != expected:
            raise SystemExit("ERROR: public application loader is not synchronized")
        if not MODULES:
            raise SystemExit("ERROR: no readable GAIA source modules found")
        print(f"GAIA public loader references {len(MODULES)} readable source modules")
        return 0
    OUTPUT.write_text(expected, encoding="utf-8")
    print(f"Built public loader for {len(MODULES)} readable source modules")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
