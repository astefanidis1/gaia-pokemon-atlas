#!/usr/bin/env python3
"""Validate the separately signed GAIA world-density phase 2 expansion."""
from __future__ import annotations

import base64
import gzip
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "public" / "data"
EDITORIAL = DATA / "editorial"
CANON = DATA / "canon"

BASE_HASH = "34cdfbf7233474b45a23906f18dbb48960fe97d6ee778d9c2e3aa294ea918374"
PHASE2_HASH = "473ec4e84a08e0b2ed08f529fe608132f56d09728597f8144e04546286cf7f37"
CANON_HASH = "0028c6891e6c31988a3a4a6957867fccfab4f6bc1e321f43ec8e68fc22c4ca95"
BASE_VERSION = "2026-07-27.2"
PHASE2_VERSION = "2026-07-28.1"
NEW_DOSSIERS = {"ursaluna", "goodra", "aggron", "zoroark", "magnezone", "basculegion"}
REGIONS = {
    "pacific-northwest-temperate-rainforest": (18, 6, 4, 3),
    "central-honshu-urban-mountain-corridor": (18, 6, 4, 3),
}


def decode(encoded: str, expected_hash: str, label: str) -> dict:
    compressed = base64.b64decode(encoded, validate=True)
    actual = hashlib.sha256(compressed).hexdigest()
    if actual != expected_hash:
        raise SystemExit(f"ERROR: {label} checksum mismatch: {actual} != {expected_hash}")
    return json.loads(gzip.decompress(compressed))


def chunks(directory: Path, count: int) -> str:
    return "".join(
        (directory / f"chunk-{index:02d}.txt").read_text(encoding="utf-8").strip()
        for index in range(1, count + 1)
    )


def coordinate(point: object) -> bool:
    return (
        isinstance(point, list)
        and len(point) == 2
        and all(isinstance(value, (int, float)) for value in point)
        and -180 <= point[0] <= 180
        and -90 <= point[1] <= 90
    )


def polygon(points: object, label: str, errors: list[str]) -> None:
    if not isinstance(points, list) or len(points) < 4:
        errors.append(f"{label} needs at least four coordinates")
        return
    if points[0] != points[-1]:
        errors.append(f"{label} is not closed")
    if not all(coordinate(point) for point in points):
        errors.append(f"{label} contains invalid coordinates")


base = decode(chunks(EDITORIAL, 4), BASE_HASH, "editorial base")
phase2_path = EDITORIAL / "phase2.txt"
if not phase2_path.exists():
    raise SystemExit("ERROR: missing world-density phase 2 payload")
phase2 = decode(phase2_path.read_text(encoding="utf-8").strip(), PHASE2_HASH, "phase 2")
canon = decode(chunks(CANON, 7), CANON_HASH, "canon")
species_slugs = {row["slug"] for row in canon["species"]}
errors: list[str] = []

if base.get("version") != BASE_VERSION:
    errors.append(f"base version mismatch: {base.get('version')} != {BASE_VERSION}")
if phase2.get("baseVersion") != BASE_VERSION:
    errors.append(f"phase 2 base mismatch: {phase2.get('baseVersion')} != {BASE_VERSION}")
if phase2.get("version") != PHASE2_VERSION:
    errors.append(f"phase 2 version mismatch: {phase2.get('version')} != {PHASE2_VERSION}")

additions = phase2.get("flagshipAdditions", [])
dossiers = phase2.get("dossiers", {})
if set(additions) != NEW_DOSSIERS or len(additions) != len(NEW_DOSSIERS):
    errors.append("phase 2 flagship additions do not match the six approved dossiers")
if set(dossiers) != NEW_DOSSIERS:
    errors.append("phase 2 dossier set does not match its flagship additions")
for slug, dossier in dossiers.items():
    if slug not in species_slugs:
        errors.append(f"missing canon species for dossier {slug}")
    if len(dossier.get("sections", [])) < 2 or len(dossier.get("archives", [])) < 2:
        errors.append(f"dossier {slug} lacks required depth")
    if not dossier.get("advisory"):
        errors.append(f"dossier {slug} lacks an advisory")
    note = dossier.get("founderNote", {})
    if not all(note.get(field) for field in ("author", "role", "text")):
        errors.append(f"dossier {slug} has an incomplete founder note")

regions = phase2.get("regions", [])
if {region.get("id") for region in regions} != set(REGIONS):
    errors.append("phase 2 regional window set is incorrect")
geometry_ids: set[str] = set()
for region in regions:
    region_id = region.get("id", "?")
    expected = REGIONS.get(region_id)
    if expected is None:
        continue
    present_count, absent_count, habitat_count, corridor_count = expected
    if region.get("realm") != "Earth" or not coordinate(region.get("center")):
        errors.append(f"{region_id} has an invalid realm or center")
    polygon(region.get("polygon"), f"{region_id} boundary", errors)
    present = [entry.get("slug") for entry in region.get("species", [])]
    absent = [entry.get("slug") for entry in region.get("absences", [])]
    if len(present) != present_count or len(set(present)) != present_count:
        errors.append(f"{region_id} must contain {present_count} unique presences")
    if len(absent) != absent_count or len(set(absent)) != absent_count:
        errors.append(f"{region_id} must contain {absent_count} unique absences")
    if set(present) & set(absent):
        errors.append(f"{region_id} marks a species both present and absent")
    for slug in present + absent:
        if slug not in species_slugs:
            errors.append(f"{region_id} references missing species {slug}")
    geometry = region.get("geometry", {})
    habitats = geometry.get("habitats", [])
    corridors = geometry.get("corridors", [])
    if len(habitats) != habitat_count or len(corridors) != corridor_count:
        errors.append(f"{region_id} geometry counts are incorrect")
    for habitat in habitats:
        geometry_id = habitat.get("id")
        if not geometry_id or geometry_id in geometry_ids:
            errors.append(f"duplicate or missing geometry ID {geometry_id}")
        geometry_ids.add(geometry_id)
        polygon(habitat.get("polygon"), f"habitat {geometry_id}", errors)
        for slug in habitat.get("species", []):
            if slug not in species_slugs:
                errors.append(f"habitat {geometry_id} references missing species {slug}")
    for corridor in corridors:
        geometry_id = corridor.get("id")
        if not geometry_id or geometry_id in geometry_ids:
            errors.append(f"duplicate or missing geometry ID {geometry_id}")
        geometry_ids.add(geometry_id)
        points = corridor.get("coordinates", [])
        if len(points) < 2 or not all(coordinate(point) for point in points):
            errors.append(f"corridor {geometry_id} has invalid coordinates")
        if not corridor.get("seasonal"):
            errors.append(f"corridor {geometry_id} lacks seasonal behavior")
        for slug in corridor.get("species", []):
            if slug not in species_slugs:
                errors.append(f"corridor {geometry_id} references missing species {slug}")

combined_flagships = base.get("flagshipOrder", []) + additions
combined_regions = base.get("regions", []) + regions
if len(combined_flagships) != 21 or len(set(combined_flagships)) != 21:
    errors.append("combined editorial layer must resolve to 21 unique full dossiers")
if len(combined_regions) != 4:
    errors.append("combined editorial layer must resolve to four regional windows")

if errors:
    print("\n".join(f"ERROR: {error}" for error in errors))
    raise SystemExit(1)

print(
    "GAIA phase 2 validation passed: "
    "6 new dossiers, 2 new regions, 8 habitats, 6 corridors; "
    "combined totals 21 dossiers, 4 regions."
)
