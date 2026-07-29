#!/usr/bin/env python3
"""Validate GAIA documentation, release metadata, continuity, assets, and assurance wiring."""
from __future__ import annotations

import json
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
require("Playwright" in readme, "README does not document browser-assurance tooling")
require("visual asset" in readme.lower(), "README does not document the visual asset policy")

continuity_path = SOURCE / "02c-continuity.js"
continuity = read_utf8(continuity_path) if continuity_path.exists() else ""
require(bool(continuity), "Missing src/app/02c-continuity.js")
for marker in ("2026-07-27.1", "2026-07-28.2", "searchTargets", "#ecology=", "CONNECTED WORLD ECOLOGY"):
    require(marker in continuity, f"Continuity module is missing marker: {marker}")

asset_path = SOURCE / "02d-assets.js"
assets = read_utf8(asset_path) if asset_path.exists() else ""
require(bool(assets), "Missing src/app/02d-assets.js")
for marker in (
    "2026-07-29.1",
    "remoteTemplate",
    "gaiaArchiveArtwork",
    "GAIA_ASSET_POLICY",
    "Civilian redacted silhouette",
):
    require(marker in assets, f"Asset policy module is missing marker: {marker}")
require(len(re.findall(r"label:'[^']+'", assets)) >= 7, "Asset policy must define at least seven authored fallback profiles")

asset_doc = texts.get(DOCS / "VISUAL_ASSET_STRATEGY.md", "")
require(asset_doc.startswith("# GAIA Atlas — Visual Asset Strategy"), "Visual asset strategy documentation is missing")
require("Seven visual profiles" in asset_doc, "Visual asset strategy does not describe the authored profile set")
experience_doc = texts.get(DOCS / "EXPERIENCE_ASSURANCE_PHASE.md", "")
require(experience_doc.startswith("# GAIA Atlas — Experience Assurance Phase"), "Experience assurance documentation is missing")
require("Playwright" in experience_doc and "axe-core" in experience_doc, "Experience assurance documentation is incomplete")

loader = read_utf8(PUBLIC / "app.js")
build = read_utf8(ROOT / "scripts" / "build_public.py")
service_worker = read_utf8(PUBLIC / "sw.js")
for label, content in (("public/app.js", loader), ("scripts/build_public.py", build), ("public/sw.js", service_worker)):
    require("02c-continuity.js" in content, f"{label} does not include the continuity module")
    require("02d-assets.js" in content, f"{label} does not include the visual asset module")
require("continuity.css" in service_worker, "Service worker does not cache continuity.css")
require("assets.css" in service_worker, "Service worker does not cache assets.css")
require(re.search(r"gaia-shell-v1\.(8|9|[1-9][0-9])", service_worker) is not None, "Service-worker cache version was not advanced for the asset pass")
require((PUBLIC / "continuity.css").is_file(), "Missing public/continuity.css")
require((PUBLIC / "assets.css").is_file(), "Missing public/assets.css")

package_path = ROOT / "package.json"
require(package_path.is_file(), "Missing package.json for experience assurance")
if package_path.is_file():
    try:
        package = json.loads(read_utf8(package_path))
    except json.JSONDecodeError as exc:
        errors.append(f"package.json is invalid JSON: {exc}")
        package = {}
    dependencies = package.get("devDependencies", {})
    require("@playwright/test" in dependencies, "Playwright is not pinned in package.json")
    require("@axe-core/playwright" in dependencies, "axe-core Playwright integration is not pinned in package.json")
    require(package.get("scripts", {}).get("test:experience") == "playwright test", "package.json test:experience script is incorrect")

playwright = read_utf8(ROOT / "playwright.config.js") if (ROOT / "playwright.config.js").is_file() else ""
tests = read_utf8(ROOT / "tests" / "gaia-experience.spec.js") if (ROOT / "tests" / "gaia-experience.spec.js").is_file() else ""
for project in ("desktop-chromium", "desktop-firefox", "mobile-chromium", "mobile-webkit", "reduced-motion-chromium"):
    require(project in playwright, f"Playwright matrix is missing project: {project}")
for marker in ("AxeBuilder", "gaia-authored-fallback", "#species=lugia", "#region=new-england", "expectNoHorizontalOverflow"):
    require(marker in tests, f"Experience tests are missing scenario marker: {marker}")

if errors:
    print("\n".join(f"ERROR: {error}" for error in errors))
    raise SystemExit(1)

print(
    f"GAIA project integrity passed: {len(markdown_files)} Markdown files, continuity, "
    "seven-profile asset policy, five-project browser matrix, and release metadata verified."
)
