#!/usr/bin/env python3
"""Validate GAIA release metadata, generated assets, offline shell, and budgets."""
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


def text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as exc:
        errors.append(f"Cannot read {path.relative_to(ROOT)} as UTF-8: {exc}")
        return ""


def kb(paths: list[Path]) -> float:
    return sum(path.stat().st_size for path in paths if path.is_file()) / 1024


index = text(PUBLIC / "index.html")
for marker in (
    "GAIA Atlas — The world is inhabited.", "data-gaia-release-head", "manifest.webmanifest",
    "gaia-social-preview.png", "gaia-apple-touch-icon.png", "release-candidate.css",
    "world-completion.css", "RC1-2026-07-29.1", "og:image", "twitter:image", 'rel="canonical"'
):
    require(marker in index, f"Release HTML is missing: {marker}")

try:
    manifest = json.loads(text(PUBLIC / "manifest.webmanifest"))
except json.JSONDecodeError as exc:
    errors.append(f"manifest.webmanifest is invalid JSON: {exc}")
    manifest = {}
require(manifest.get("display") == "standalone", "Manifest must use standalone display")
require(manifest.get("theme_color") == "#071019", "Manifest theme color is not GAIA navy")
require(any(icon.get("purpose") == "maskable" for icon in manifest.get("icons", [])), "Manifest lacks a maskable icon")

assets = [
    PUBLIC / "assets" / "gaia-social-preview.png",
    PUBLIC / "assets" / "gaia-icon-192.png",
    PUBLIC / "assets" / "gaia-icon-512.png",
    PUBLIC / "assets" / "gaia-icon-maskable-512.png",
    PUBLIC / "assets" / "gaia-apple-touch-icon.png",
]
for asset in assets:
    require(asset.is_file(), f"Missing generated asset: {asset.relative_to(ROOT)}")
if assets[0].is_file():
    require(assets[0].stat().st_size / 1024 <= BUDGETS["social_preview_max_kb"], "Social preview exceeds budget")
icons = [path for path in assets[1:] if path.is_file()]
if icons:
    require(max(path.stat().st_size for path in icons) / 1024 <= BUDGETS["largest_icon_max_kb"], "An install icon exceeds budget")

for path, marker in (
    (PUBLIC / "offline.html", "CIVILIAN ARCHIVE MODE"),
    (PUBLIC / "404.html", "COORDINATE UNRESOLVED"),
    (PUBLIC / "release-candidate.css", ".rc-priority-brief"),
    (PUBLIC / "world-completion.css", ".world-state-feed"),
    (SOURCE / "02f-release-candidate.js", "PRIORITY WORLD BRIEF"),
    (SOURCE / "02g-world-completion.js", "CIVILIAN SUMMARY RECORD"),
):
    require(path.is_file(), f"Missing release file: {path.relative_to(ROOT)}")
    if path.is_file():
        require(marker in text(path), f"{path.relative_to(ROOT)} is missing marker: {marker}")

phase4_paths = [PUBLIC / "data" / "editorial" / f"phase4{suffix}.txt" for suffix in ("", "-02", "-03", "-04", "-05", "-06")]
for path in phase4_paths:
    require(path.is_file(), f"Missing World Completion transport file: {path.relative_to(ROOT)}")
    if path.is_file():
        require(len(text(path).strip()) > 1000, f"World Completion transport file is unexpectedly short: {path.name}")
require(text(phase4_paths[0]).startswith("H4sI"), "First World Completion semantic payload is not gzip/Base64 transport")
require(text(phase4_paths[3]).startswith("H4sI"), "Second World Completion semantic payload is not gzip/Base64 transport")

critical_paths = [
    PUBLIC / "index.html", PUBLIC / "app.js", PUBLIC / "styles.css", PUBLIC / "refinement.css",
    PUBLIC / "density.css", PUBLIC / "ecology.css", PUBLIC / "continuity.css", PUBLIC / "assets.css",
    PUBLIC / "assurance.css", PUBLIC / "release-candidate.css", PUBLIC / "world-completion.css",
    PUBLIC / "data" / "canon.js", *sorted(SOURCE.glob("*.js")),
]
critical_kb = kb(critical_paths)
require(critical_kb <= BUDGETS["critical_shell_max_kb"], f"Critical shell is {critical_kb:.1f} KB, over budget")

data_paths = [path for path in (PUBLIC / "data").rglob("*") if path.is_file()]
data_kb = kb(data_paths)
require(data_kb <= BUDGETS["data_payload_max_kb"], f"Data payload is {data_kb:.1f} KB, over budget")

text_assets = [path for path in PUBLIC.rglob("*") if path.is_file() and path.suffix.lower() in {".js", ".css", ".html", ".json", ".txt", ".svg", ".webmanifest"}]
if text_assets:
    largest = max(text_assets, key=lambda path: path.stat().st_size)
    require(largest.stat().st_size / 1024 <= BUDGETS["largest_text_asset_max_kb"], f"Largest text asset exceeds budget: {largest.relative_to(ROOT)}")

sw = text(PUBLIC / "sw.js")
for marker in ("offline.html", "gaia-social-preview.png", "02f-release-candidate.js", "02g-world-completion.js", "gaia-shell-v2.3"):
    require(marker in sw, f"Service worker is missing: {marker}")
for path in phase4_paths:
    require(f"data/editorial/{path.name}" in sw, f"Service worker does not cache {path.name}")
match = re.search(r"const SHELL\s*=\s*\[(.*?)\];", sw, re.S)
entries = re.findall(r"['\"]([^'\"]+)['\"]", match.group(1)) if match else []
require(bool(entries), "Service-worker shell could not be parsed")
require(len(entries) <= BUDGETS["service_worker_shell_entries_max"], f"Service-worker shell has {len(entries)} entries, over budget")

if errors:
    print("\n".join(f"ERROR: {error}" for error in errors))
    raise SystemExit(1)

print(
    f"GAIA private artifact passed: critical shell {critical_kb:.1f} KB, data {data_kb:.1f} KB, "
    f"{len(entries)} offline entries, six transport files, two signed semantic payloads, metadata, and generated assets verified."
)
