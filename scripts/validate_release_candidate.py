#!/usr/bin/env python3
"""Validate GAIA Release Candidate metadata, assets, offline behavior, World Completion, and budgets."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SOURCE = ROOT / "src" / "app"
BUDGETS = json.loads((ROOT / "performance-budgets.json").read_text(encoding="utf-8"))
errors: list[str] = []


def require(condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)


def kb(paths: list[Path]) -> float:
    return sum(path.stat().st_size for path in paths if path.is_file()) / 1024


def text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as exc:
        errors.append(f"Cannot read {path.relative_to(ROOT)} as UTF-8: {exc}")
        return ""


index = text(PUBLIC / "index.html")
for marker in (
    'GAIA Atlas — The world is inhabited.',
    'data-gaia-release-head',
    'manifest.webmanifest',
    'gaia-social-preview.png',
    'gaia-apple-touch-icon.png',
    'release-candidate.css',
    'world-completion.css',
    'RC1-2026-07-29.1',
    'og:image',
    'twitter:image',
    'rel="canonical"',
):
    require(marker in index, f"RC1 index metadata missing marker: {marker}")

manifest_path = PUBLIC / "manifest.webmanifest"
require(manifest_path.is_file(), "Missing public/manifest.webmanifest")
if manifest_path.is_file():
    try:
        manifest = json.loads(text(manifest_path))
    except json.JSONDecodeError as exc:
        errors.append(f"manifest.webmanifest is invalid JSON: {exc}")
        manifest = {}
    require(manifest.get("display") == "standalone", "Manifest must use standalone display")
    require(manifest.get("theme_color") == "#071019", "Manifest theme color is not GAIA navy")
    purposes = {icon.get("purpose") for icon in manifest.get("icons", [])}
    require("maskable" in purposes, "Manifest lacks a maskable icon")

required_assets = (
    PUBLIC / "assets" / "gaia-social-preview.png",
    PUBLIC / "assets" / "gaia-icon-192.png",
    PUBLIC / "assets" / "gaia-icon-512.png",
    PUBLIC / "assets" / "gaia-icon-maskable-512.png",
    PUBLIC / "assets" / "gaia-apple-touch-icon.png",
)
for asset in required_assets:
    require(asset.is_file(), f"Missing release asset: {asset.relative_to(ROOT)}")

social = PUBLIC / "assets" / "gaia-social-preview.png"
if social.is_file():
    require(social.stat().st_size / 1024 <= BUDGETS["social_preview_max_kb"], "Social preview exceeds performance budget")
icons = [path for path in required_assets if path.name != "gaia-social-preview.png" and path.is_file()]
if icons:
    require(max(path.stat().st_size for path in icons) / 1024 <= BUDGETS["largest_icon_max_kb"], "An install icon exceeds performance budget")

for path, marker in (
    (PUBLIC / "offline.html", "CIVILIAN ARCHIVE MODE"),
    (PUBLIC / "404.html", "COORDINATE UNRESOLVED"),
    (PUBLIC / "release-candidate.css", ".rc-priority-brief"),
    (PUBLIC / "world-completion.css", ".world-state-feed"),
    (SOURCE / "02f-release-candidate.js", "PRIORITY WORLD BRIEF"),
    (SOURCE / "02g-world-completion.js", "CIVILIAN SUMMARY RECORD"),
    (PUBLIC / "data" / "editorial" / "phase4.txt", "H4sI"),
):
    require(path.is_file(), f"Missing release/completion file: {path.relative_to(ROOT)}")
    if path.is_file():
        require(marker in text(path), f"{path.relative_to(ROOT)} missing marker: {marker}")

phase4_tail = PUBLIC / "data" / "editorial" / "phase4-02.txt"
require(phase4_tail.is_file(), "Missing second World Completion editorial chunk")
if phase4_tail.is_file():
    require(len(text(phase4_tail).strip()) > 1000, "Second World Completion editorial chunk is unexpectedly short")

critical_paths = [
    PUBLIC / "index.html", PUBLIC / "app.js", PUBLIC / "styles.css", PUBLIC / "refinement.css",
    PUBLIC / "density.css", PUBLIC / "ecology.css", PUBLIC / "continuity.css", PUBLIC / "assets.css",
    PUBLIC / "assurance.css", PUBLIC / "release-candidate.css", PUBLIC / "world-completion.css",
    PUBLIC / "data" / "canon.js", *sorted(SOURCE.glob("*.js")),
]
critical_kb = kb(critical_paths)
require(critical_kb <= BUDGETS["critical_shell_max_kb"], f"Critical shell is {critical_kb:.1f} KB, over {BUDGETS['critical_shell_max_kb']} KB")

data_paths = [path for path in (PUBLIC / "data").rglob("*") if path.is_file()]
data_kb = kb(data_paths)
require(data_kb <= BUDGETS["data_payload_max_kb"], f"Data payload is {data_kb:.1f} KB, over {BUDGETS['data_payload_max_kb']} KB")

text_assets = [path for path in PUBLIC.rglob("*") if path.is_file() and path.suffix.lower() in {".js", ".css", ".html", ".json", ".txt", ".svg", ".webmanifest"}]
if text_assets:
    largest = max(text_assets, key=lambda path: path.stat().st_size)
    largest_kb = largest.stat().st_size / 1024
    require(largest_kb <= BUDGETS["largest_text_asset_max_kb"], f"Largest text asset {largest.relative_to(ROOT)} is {largest_kb:.1f} KB")

sw = text(PUBLIC / "sw.js")
require("offline.html" in sw, "Service worker does not include the offline fallback")
require("gaia-social-preview.png" in sw, "Service worker does not cache the social preview")
require("02f-release-candidate.js" in sw, "Service worker does not cache the RC1 module")
require("02g-world-completion.js" in sw, "Service worker does not cache the World Completion module")
require("data/editorial/phase4.txt" in sw, "Service worker does not cache the first World Completion editorial chunk")
require("data/editorial/phase4-02.txt" in sw, "Service worker does not cache the second World Completion editorial chunk")
match = re.search(r"const SHELL\s*=\s*\[(.*?)\];", sw, re.S)
entries = re.findall(r"['\"]([^'\"]+)['\"]", match.group(1)) if match else []
require(bool(entries), "Service-worker shell could not be parsed")
require(len(entries) <= BUDGETS["service_worker_shell_entries_max"], f"Service-worker shell has {len(entries)} entries")

if errors:
    print("\n".join(f"ERROR: {error}" for error in errors))
    raise SystemExit(1)

print(
    f"GAIA private release artifact passed: critical shell {critical_kb:.1f} KB, data {data_kb:.1f} KB, "
    f"{len(entries)} offline-shell entries, metadata, split World Completion payload, and production assets verified."
)
