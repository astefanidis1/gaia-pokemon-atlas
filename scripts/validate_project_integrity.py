#!/usr/bin/env python3
"""Validate GAIA documentation, continuity, assets, assurance, and RC1 wiring."""
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

continuity = read_utf8(SOURCE / "02c-continuity.js") if (SOURCE / "02c-continuity.js").exists() else ""
require(bool(continuity), "Missing src/app/02c-continuity.js")
for marker in ("2026-07-27.1", "2026-07-28.2", "searchTargets", "#ecology=", "CONNECTED WORLD ECOLOGY"):
    require(marker in continuity, f"Continuity module is missing marker: {marker}")

assets = read_utf8(SOURCE / "02d-assets.js") if (SOURCE / "02d-assets.js").exists() else ""
require(bool(assets), "Missing src/app/02d-assets.js")
for marker in ("2026-07-29.1", "remoteTemplate", "gaiaArchiveArtwork", "GAIA_ASSET_POLICY", "Civilian redacted silhouette"):
    require(marker in assets, f"Asset policy module is missing marker: {marker}")
require(len(re.findall(r"label:'[^']+'", assets)) >= 7, "Asset policy must define at least seven authored fallback profiles")

assurance = read_utf8(SOURCE / "02e-assurance.js") if (SOURCE / "02e-assurance.js").exists() else ""
require(bool(assurance), "Missing src/app/02e-assurance.js")
for marker in ("GAIA_ASSURANCE_VERSION", "role','combobox", "aria-hidden", "inert", "gaia-reduced-motion", "assetState='archive'"):
    require(marker in assurance, f"Assurance module is missing marker: {marker}")

release = read_utf8(SOURCE / "02f-release-candidate.js") if (SOURCE / "02f-release-candidate.js").exists() else ""
require(bool(release), "Missing src/app/02f-release-candidate.js")
for marker in ("GAIA_RC_VERSION", "PRIORITY WORLD BRIEF", "rcStorageKey", "OFFLINE ARCHIVE", "gaiaRelease='rc1'"):
    require(marker in release, f"Release-candidate module is missing marker: {marker}")

asset_doc = texts.get(DOCS / "VISUAL_ASSET_STRATEGY.md", "")
require(asset_doc.startswith("# GAIA Atlas — Visual Asset Strategy"), "Visual asset strategy documentation is missing")
require("Seven visual profiles" in asset_doc, "Visual asset strategy does not describe the authored profile set")
experience_doc = texts.get(DOCS / "EXPERIENCE_ASSURANCE_PHASE.md", "")
require(experience_doc.startswith("# GAIA Atlas — Experience Assurance Phase"), "Experience assurance documentation is missing")
require("Playwright" in experience_doc and "axe-core" in experience_doc, "Experience assurance documentation is incomplete")
rc_doc = texts.get(DOCS / "RELEASE_CANDIDATE_1.md", "")
require(rc_doc.startswith("# GAIA Atlas — Release Candidate 1"), "RC1 documentation is missing")
for marker in ("Priority World Brief", "performance-budgets.json", "Civilian Archive Mode", "release candidate, not a release"):
    require(marker.lower() in rc_doc.lower(), f"RC1 documentation is missing: {marker}")

loader = read_utf8(PUBLIC / "app.js")
build = read_utf8(ROOT / "scripts" / "build_public.py")
service_worker = read_utf8(PUBLIC / "sw.js")
for label, content in (("public/app.js", loader), ("scripts/build_public.py", build), ("public/sw.js", service_worker)):
    for module in ("02c-continuity.js", "02d-assets.js", "02e-assurance.js", "02f-release-candidate.js"):
        require(module in content, f"{label} does not include {module}")
for asset in ("continuity.css", "assets.css", "assurance.css", "release-candidate.css", "offline.html", "manifest.webmanifest"):
    require(asset in service_worker, f"Service worker does not cache {asset}")
require("gaia-shell-v2.0" in service_worker, "Service-worker cache version was not advanced for RC1")
for path in (PUBLIC / "continuity.css", PUBLIC / "assets.css", PUBLIC / "assurance.css", PUBLIC / "release-candidate.css"):
    require(path.is_file(), f"Missing {path.relative_to(ROOT)}")

package_path = ROOT / "package.json"
require(package_path.is_file(), "Missing package.json for experience assurance")
if package_path.is_file():
    try:
        package = json.loads(read_utf8(package_path))
    except json.JSONDecodeError as exc:
        errors.append(f"package.json is invalid JSON: {exc}")
        package = {}
    dependencies = package.get("devDependencies", {})
    scripts = package.get("scripts", {})
    require("@playwright/test" in dependencies, "Playwright is not pinned in package.json")
    require("@axe-core/playwright" in dependencies, "axe-core Playwright integration is not pinned in package.json")
    require(scripts.get("test:experience") == "playwright test", "package.json test:experience script is incorrect")
    require("prepare_release_candidate.py" in scripts.get("prepare:rc", ""), "package.json prepare:rc script is incorrect")
    require("validate_release_candidate.py" in scripts.get("validate:rc", ""), "package.json validate:rc script is incorrect")

playwright = read_utf8(ROOT / "playwright.config.js") if (ROOT / "playwright.config.js").is_file() else ""
experience_tests = read_utf8(ROOT / "tests" / "gaia-experience.spec.js") if (ROOT / "tests" / "gaia-experience.spec.js").is_file() else ""
layout_tests = read_utf8(ROOT / "tests" / "gaia-layout.spec.js") if (ROOT / "tests" / "gaia-layout.spec.js").is_file() else ""
release_tests = read_utf8(ROOT / "tests" / "gaia-release-candidate.spec.js") if (ROOT / "tests" / "gaia-release-candidate.spec.js").is_file() else ""
for project in ("desktop-chromium", "desktop-firefox", "mobile-chromium", "mobile-webkit", "reduced-motion-chromium"):
    require(project in playwright, f"Playwright matrix is missing project: {project}")
for marker in ("AxeBuilder", "gaia-authored-fallback", "#species=lugia", "#region=new-england", "expectNoHorizontalOverflow", "gaia-reduced-motion", "emulateMedia"):
    require(marker in experience_tests, f"Experience tests are missing scenario marker: {marker}")
for marker in ("desktop command panels expose their complete primary actions", "mobile globe uses one compact terminal and fixed navigation", ".region-launch", ".ecology-layer-panel", "#surveillanceTicker"):
    require(marker in layout_tests, f"Responsive layout tests are missing scenario marker: {marker}")
for marker in ("PRIORITY WORLD BRIEF", "gaia-release", "weak network", "fully offline", "performance-budgets.json"):
    require(marker in release_tests, f"RC1 tests are missing scenario marker: {marker}")

for path in (ROOT / "scripts" / "prepare_release_candidate.py", ROOT / "scripts" / "generate_release_assets.py", ROOT / "scripts" / "validate_release_candidate.py", ROOT / "performance-budgets.json"):
    require(path.is_file(), f"Missing RC1 infrastructure: {path.relative_to(ROOT)}")

if errors:
    print("\n".join(f"ERROR: {error}" for error in errors))
    raise SystemExit(1)

print(
    f"GAIA project integrity passed: {len(markdown_files)} Markdown files, continuity, seven-profile asset policy, "
    "accessibility assurance, responsive collision guards, RC1 first-visit/navigation wiring, generated assets, and release gates verified."
)
