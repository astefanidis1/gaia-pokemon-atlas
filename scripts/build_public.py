#!/usr/bin/env python3
"""Build the compact public JavaScript payload from readable source."""
from __future__ import annotations

import argparse
import base64
import gzip
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "src" / "app"
OUTPUT = ROOT / "public" / "app.js"
CHUNK_DIR = ROOT / "public" / "code"
CHUNK_SIZE = 6000


def source_text() -> str:
    return "".join(path.read_text(encoding="utf-8") for path in sorted(SOURCE_DIR.glob("*.js")))


def payload_chunks(source: str) -> list[str]:
    compressed = gzip.compress(source.encode("utf-8"), compresslevel=9, mtime=0)
    encoded = base64.b64encode(compressed).decode("ascii")
    return [encoded[index:index + CHUNK_SIZE] for index in range(0, len(encoded), CHUNK_SIZE)]


def loader(chunk_count: int) -> str:
    return f"""(()=>{{
  const paths=Array.from({{length:{chunk_count}}},(_,index)=>`code/chunk-${{String(index+1).padStart(2,'0')}}.txt`);
  Promise.all(paths.map(async path=>{{
    const response=await fetch(path,{{cache:'no-cache'}});
    if(!response.ok) throw new Error(`Unable to load GAIA application payload: ${{path}}`);
    return (await response.text()).trim();
  }})).then(parts=>{{
    const bytes=Uint8Array.from(atob(parts.join('')),character=>character.charCodeAt(0));
    return new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
  }}).then(code=>(0,eval)(code)).catch(error=>{{
    console.error(error);
    const loading=document.querySelector('#loading');
    if(loading) loading.innerHTML='<img src="assets/gaia-seal.svg" alt=""><strong>GAIA application link unavailable</strong><span>The public interface could not be verified. Reload to try again.</span>';
  }});
}})();
"""


def expected_files() -> dict[Path, str]:
    chunks = payload_chunks(source_text())
    files = {OUTPUT: loader(len(chunks))}
    for index, chunk in enumerate(chunks, 1):
        files[CHUNK_DIR / f"chunk-{index:02d}.txt"] = chunk
    return files


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Fail if public code payload is not current")
    args = parser.parse_args()
    files = expected_files()
    if args.check:
        errors=[]
        for path, expected in files.items():
            actual=path.read_text(encoding="utf-8") if path.exists() else ""
            if actual != expected:
                errors.append(str(path.relative_to(ROOT)))
        existing=set(CHUNK_DIR.glob("chunk-*.txt")) if CHUNK_DIR.exists() else set()
        expected_chunks={path for path in files if path.parent == CHUNK_DIR}
        extras=existing-expected_chunks
        errors.extend(str(path.relative_to(ROOT)) for path in sorted(extras))
        if errors:
            raise SystemExit("ERROR: public code payload is not synchronized: " + ", ".join(errors))
        print(f"GAIA public code payload is synchronized ({len(expected_chunks)} chunks)")
        return 0
    CHUNK_DIR.mkdir(parents=True, exist_ok=True)
    for old in CHUNK_DIR.glob("chunk-*.txt"):
        old.unlink()
    for path, content in files.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
    print(f"Built {len(files)-1} public code chunks from {len(list(SOURCE_DIR.glob('*.js')))} source modules")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
