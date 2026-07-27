#!/usr/bin/env python3
"""Reconstruct the exact polished GAIA public site from versioned release chunks."""
from __future__ import annotations

import argparse
import base64
import hashlib
import io
import json
import shutil
import tarfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RELEASE = ROOT / "release" / "polished-public"
DIST = ROOT / "dist"


def load_archive() -> tuple[dict, bytes]:
    manifest = json.loads((RELEASE / "manifest.json").read_text(encoding="utf-8"))
    encoded = "".join(
        (RELEASE / f"chunk-{index:02d}.txt").read_text(encoding="utf-8").strip()
        for index in range(1, manifest["chunkCount"] + 1)
    )
    if len(encoded) != manifest["encodedLength"]:
        raise SystemExit(
            f"ERROR: release encoded length mismatch: {len(encoded)} != {manifest['encodedLength']}"
        )
    archive = base64.b64decode(encoded, validate=True)
    actual = hashlib.sha256(archive).hexdigest()
    if actual != manifest["sha256"]:
        raise SystemExit(f"ERROR: release checksum mismatch: {actual} != {manifest['sha256']}")
    return manifest, archive


def safe_extract(archive: bytes, destination: Path) -> None:
    destination_resolved = destination.resolve()
    with tarfile.open(fileobj=io.BytesIO(archive), mode="r:gz") as bundle:
        for member in bundle.getmembers():
            target = (destination / member.name).resolve()
            if destination_resolved not in target.parents and target != destination_resolved:
                raise SystemExit(f"ERROR: unsafe archive path: {member.name}")
        bundle.extractall(destination, filter="data")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Verify the bundle and required release files")
    parser.parse_args()

    manifest, archive = load_archive()
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)
    safe_extract(archive, DIST)

    required = [
        "index.html",
        "styles.css",
        "app.js",
        "assets/gaia-seal.svg",
        "data/canon.js",
        "data/canon-corrections.json",
        "data/canon/chunk-07.txt",
        "data/editorial/chunk-03.txt",
        "code/chunk-03.txt",
    ]
    missing = [path for path in required if not (DIST / path).is_file()]
    if missing:
        raise SystemExit("ERROR: polished release is missing: " + ", ".join(missing))

    print(
        f"GAIA polished release {manifest['version']} verified and extracted: "
        f"{manifest['chunkCount']} chunks, SHA-256 {manifest['sha256']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
