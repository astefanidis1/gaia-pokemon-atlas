#!/usr/bin/env python3
"""Validate GAIA documentation, release metadata, and continuity-pass wiring."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
PUBLIC = ROOT / "public"
SOURCE = ROOT / "src" / "app"

errors: list[str] = []


def require(condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)


def read_utf8(path: Path) -> str:
    try:
        raw = path.read_bytes()
        text = raw.decode("utf-8", errors="strict")
    except (OSError, UnicodeDecodeError) as exc:
        errors.append(f"{path.relative_to(ROOT)} is not valid UTF-8: {exc}")
        return ""
    controls = sorted({ord(char) for char in text if ord(char) < 32 and char not in "\n\r\t"})
    if controls:
        errors.append(f"{path.relative_to(ROOT)} contains control bytes: {controls}")
    return text


markdown_files = sorted([ROOT / "README.md", *DOCS.glob("*.md")])
texts = {path: read_utf8(path) for path in markdown_files}

phase3 = texts.get(DOCS / "WORLD_ECOLOGY_PHASE_3.md", "")
require(phase3.startswith("# GAIA Atlas — World Ecology Phase 3"), "Phase 3 documentation heading is missing or corrupted")
for marker in ("27 full dossiers", "16 habitat systems", "12 ecological corridors", "16 ecological relationships"):
    require(marker in phase3, f"Phase 3 documentation is missing: {marker}")

polish = texts.get(DOCS / "POLISH_PASS.md", "")
require("public/code/" not in polish, "POLISH_PASS.md still references the obsolete public/code payload")
require("src/app/*.js" in polish, "POLISH_PASS.md does not describe the readable source-module architecture")

readme = texts.get(ROOT / "README.md", "")
require("http://localhost:8000/public/" in readme, "README local-run URL must serve the repository root and open /public/")
require("Universal search" in readme, "README does not document universal atlas search")

continuity_path = SOURCE / "02c-continuity.js"
continuity = read_utf8(continuity_path) if continuity_path.exists() else ""
require(bool(continuity), "Missing src/app/02c-continuity.js")
for marker in (
    "2026-07-27.1",
    "2026-07-28.2",
    "searchTargets",
    "#ecology=",
    "CONNECTED WORLD ECOLOGY",
):
    require(marker in continuity, f"Continuity module is missing marker: {marker}")

loader = read_utf8(PUBLIC / "app.js")
build = read_utf8(ROOT / "scripts" / "build_public.py")
service_worker = read_utf8(PUBLIC / "sw.js")
for label, content in (("public/app.js", loader), ("scripts/build_public.py", build), ("public/sw.js", service_worker)):
    require("02c-continuity.js" in content, f"{label} does not include the continuity module")
require("continuity.css" in service_worker, "Service worker does not cache continuity.css")
require(re.search(r"gaia-shell-v1\.[7-9]", service_worker) is not None, "Service-worker cache version was not advanced for the continuity pass")
require((PUBLIC / "continuity.css").is_file(), "Missing public/continuity.css")

if errors:
    print("\n".join(f"ERROR: {error}" for error in errors))
    raise SystemExit(1)

print(f"GAIA project integrity passed: {len(markdown_files)} Markdown files, continuity search/deep links, and release metadata verified.")
