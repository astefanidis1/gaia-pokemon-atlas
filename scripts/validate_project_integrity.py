#!/usr/bin/env python3
"""Validate GAIA documentation and cross-layer release wiring."""
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
        text = path.read_bytes().decode("utf-8", errors="strict")
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
require(phase3.startswith("# GAIA Atlas — World Ecology Phase 3"), "Phase 3 documentation is missing or corrupted")
for marker in ("27 full dossiers", "16 habitat systems", "12 ecological corridors", "16 ecological relationships"):
    require(marker in phase3, f"Phase 3 documentation is missing: {marker}")

completion_doc = texts.get(DOCS / "WORLD_COMPLETION_PASS_1.md", "")
require(completion_doc.startswith("# GAIA Atlas — World Completion Pass I"), "World Completion Pass I documentation is missing")
for marker in ("Civilian Summary Record", "Central Andes", "East African Rift", "canonical location", "archive reader", "24 habitat systems", "18 ecological corridors", "24 ecological relationships"):
    require(marker.lower() in completion_doc.lower(), f"World Completion documentation is missing: {marker}")

transport_doc = texts.get(DOCS / "WORLD_COMPLETION_PAYLOAD.md", "")
for marker in ("two independently signed semantic payloads", "phase4-06.txt", "eb175457", "3744e928", "ed2e0be2"):
    require(marker.lower() in transport_doc.lower(), f"World Completion transport documentation is missing: {marker}")

readme = texts.get(ROOT / "README.md", "")
for marker in ("http://localhost:8000/public/", "Universal search", "Playwright", "visual asset", "World Completion Pass I", "thirteen readable browser modules"):
    require(marker.lower() in readme.lower(), f"README is missing: {marker}")
require("public/code/" not in texts.get(DOCS / "POLISH_PASS.md", ""), "POLISH_PASS.md references obsolete public/code payload")

module_markers = {
    "02c-continuity.js": ("searchTargets", "#ecology=", "CONNECTED WORLD ECOLOGY"),
    "02d-assets.js": ("GAIA_ASSET_POLICY", "gaiaArchiveArtwork", "Civilian redacted silhouette"),
    "02e-assurance.js": ("GAIA_ASSURANCE_VERSION", "role','combobox", "gaia-reduced-motion", "inert"),
    "02f-release-candidate.js": ("GAIA_RC_VERSION", "PRIORITY WORLD BRIEF", "OFFLINE ARCHIVE", "https://zandros.fanlink.tv/ZANDROS", "sw-world-completion.js"),
    "02g-world-completion.js": ("GAIA_WORLD_COMPLETION_VERSION", "Civilian Summary Record", "gaia-field-observations-v2", "regionalConditionGrid", "archiveReaderModal", "indexDepth"),
}
for filename, markers in module_markers.items():
    path = SOURCE / filename
    content = read_utf8(path) if path.is_file() else ""
    require(bool(content), f"Missing {path.relative_to(ROOT)}")
    for marker in markers:
        require(marker.lower() in content.lower(), f"{filename} is missing marker: {marker}")
require("not yet published" not in read_utf8(SOURCE / "02g-world-completion.js").lower(), "World Completion reintroduces unfinished-publication language")
require(len(re.findall(r"label:'[^']+'", read_utf8(SOURCE / "02d-assets.js"))) >= 7, "Asset policy must retain seven authored profiles")

loader = read_utf8(PUBLIC / "app.js")
build = read_utf8(ROOT / "scripts" / "build_public.py")
world_worker_path = PUBLIC / "sw-world-completion.js"
world_worker = read_utf8(world_worker_path) if world_worker_path.is_file() else ""
for label, content in (("public/app.js", loader), ("scripts/build_public.py", build)):
    for module in module_markers:
        require(module in content, f"{label} does not include {module}")
require(bool(world_worker), "Missing public/sw-world-completion.js")
for module in module_markers:
    require(module in world_worker, f"public/sw-world-completion.js does not include {module}")
require("gaia-world-shell-v1" in world_worker, "Dedicated World Completion service-worker cache version is missing")

phase4_files = [PUBLIC / "data" / "editorial" / f"phase4{suffix}.txt" for suffix in ("", "-02", "-03", "-04", "-05", "-06")]
for path in phase4_files:
    require(path.is_file(), f"Missing World Completion transport file: {path.relative_to(ROOT)}")
    require(path.name in world_worker, f"World Completion service worker does not cache {path.name}")
for path in (PUBLIC / "continuity.css", PUBLIC / "assets.css", PUBLIC / "assurance.css", PUBLIC / "release-candidate.css", PUBLIC / "world-completion.css"):
    require(path.is_file(), f"Missing {path.relative_to(ROOT)}")

required_infra = (
    PUBLIC / "sw-world-completion.js",
    ROOT / "scripts" / "validate_phase4.py",
    ROOT / "scripts" / "prepare_release_candidate.py",
    ROOT / "scripts" / "generate_release_assets.py",
    ROOT / "scripts" / "validate_release_candidate.py",
    ROOT / "performance-budgets.json",
    ROOT / "tests" / "gaia-experience.spec.js",
    ROOT / "tests" / "gaia-layout.spec.js",
    ROOT / "tests" / "gaia-release-candidate.spec.js",
    ROOT / "tests" / "gaia-world-completion.spec.js",
)
for path in required_infra:
    require(path.is_file(), f"Missing infrastructure: {path.relative_to(ROOT)}")

package_path = ROOT / "package.json"
try:
    package = json.loads(read_utf8(package_path))
except json.JSONDecodeError as exc:
    errors.append(f"package.json is invalid JSON: {exc}")
    package = {}
dependencies = package.get("devDependencies", {})
scripts = package.get("scripts", {})
require("@playwright/test" in dependencies and "@axe-core/playwright" in dependencies, "Browser-assurance dependencies are not pinned")
require(scripts.get("test:experience") == "playwright test", "test:experience script is incorrect")
require("validate_phase4.py" in scripts.get("validate:world", ""), "validate:world script is incomplete")

playwright = read_utf8(ROOT / "playwright.config.js")
for project in ("desktop-chromium", "desktop-firefox", "mobile-chromium", "mobile-webkit", "reduced-motion-chromium"):
    require(project in playwright, f"Playwright matrix is missing project: {project}")

scenario_files = {
    "gaia-experience.spec.js": ("AxeBuilder", "gaia-authored-fallback", "#species=lugia", "expectNoHorizontalOverflow"),
    "gaia-layout.spec.js": ("desktop command panels expose their complete primary actions", "mobile globe uses one compact terminal and fixed navigation"),
    "gaia-release-candidate.spec.js": ("PRIORITY WORLD BRIEF", "weak network", "fully offline", "Listen to ZANDROS"),
    "gaia-world-completion.spec.js": ("CIVILIAN SUMMARY RECORD", "regionalConditionGrid", "gaia-field-observations-v2", "archiveReaderModal", "Central Andes"),
}
for filename, markers in scenario_files.items():
    content = read_utf8(ROOT / "tests" / filename)
    for marker in markers:
        require(marker in content, f"{filename} is missing scenario marker: {marker}")

for path, heading in (
    (DOCS / "VISUAL_ASSET_STRATEGY.md", "# GAIA Atlas — Visual Asset Strategy"),
    (DOCS / "EXPERIENCE_ASSURANCE_PHASE.md", "# GAIA Atlas — Experience Assurance Phase"),
    (DOCS / "RELEASE_CANDIDATE_1.md", "# GAIA Atlas — Release Candidate 1"),
):
    require(texts.get(path, "").startswith(heading), f"Missing documentation heading: {heading}")

if errors:
    print("\n".join(f"ERROR: {error}" for error in errors))
    raise SystemExit(1)

print(
    f"GAIA project integrity passed: {len(markdown_files)} Markdown files, thirteen readable modules, "
    "six-part/two-signature World Completion transport, dedicated offline worker, browser matrix, and completion scenarios verified."
)
