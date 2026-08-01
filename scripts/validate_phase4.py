#!/usr/bin/env python3
"""Validate GAIA World Completion Pass I without modifying signed population canon."""
from __future__ import annotations

import base64
import gzip
import hashlib
import json
from collections import Counter
from pathlib import Path

from phase3_validation_data import coord, load_inputs

ROOT = Path(__file__).resolve().parents[1]
PHASE4_GROUPS = [
    [ROOT / "public/data/editorial/phase4.txt", ROOT / "public/data/editorial/phase4-02.txt", ROOT / "public/data/editorial/phase4-03.txt"],
    [ROOT / "public/data/editorial/phase4-04.txt", ROOT / "public/data/editorial/phase4-05.txt", ROOT / "public/data/editorial/phase4-06.txt"],
]
PHASE4_HASHES = [
    "eb1754571dc7c04e3d62f802765e5148f54ef6fd13b9e4c1820f87423c4b3941",
    "3744e928bd8b35df9e2b8a61d02e1ff7472ff07155d5458ec312d8e66ddd5937",
]
PHASE4_MERGED_HASH = "ed2e0be29dcd699bf207fb4b4bd1fd6e5cee513b4b117b748ed906dae10deed3"
PHASE4_VERSION = "2026-08-01.1"
PHASE4_BASE = "2026-07-28.2"
REGION_COUNTS = {
    "central-andes-cloud-forest-corridor": (18, 5, 4, 3),
    "east-african-rift-highland-mosaic": (18, 5, 4, 3),
}


def load_payload(paths: list[Path], expected_hash: str) -> dict:
    encoded = "".join(path.read_text(encoding="utf-8").strip() for path in paths)
    raw = base64.b64decode(encoded, validate=True)
    actual = hashlib.sha256(raw).hexdigest()
    if actual != expected_hash:
        raise SystemExit(f"ERROR: semantic checksum mismatch for {[p.name for p in paths]}: {actual} != {expected_hash}")
    return json.loads(gzip.decompress(raw))


def load_phase4() -> dict:
    payloads = [load_payload(paths, checksum) for paths, checksum in zip(PHASE4_GROUPS, PHASE4_HASHES)]
    if {p.get("baseVersion") for p in payloads} != {PHASE4_BASE} or {p.get("version") for p in payloads} != {PHASE4_VERSION}:
        raise SystemExit("ERROR: Phase 4 semantic payload version mismatch")
    merged = {
        "baseVersion": PHASE4_BASE,
        "version": PHASE4_VERSION,
        "recordPolicy": next((p.get("recordPolicy") for p in payloads if p.get("recordPolicy")), {}),
        "regions": [r for p in payloads for r in p.get("regions", [])],
        "relationships": [r for p in payloads for r in p.get("relationships", [])],
    }
    compact = json.dumps(merged, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    actual = hashlib.sha256(compact).hexdigest()
    if actual != PHASE4_MERGED_HASH:
        raise SystemExit(f"ERROR: merged Phase 4 hash mismatch: {actual} != {PHASE4_MERGED_HASH}")
    return merged


def phase3_regions(base: dict, phase2: dict, phase3: dict) -> list[dict]:
    regions = json.loads(json.dumps(base.get("regions", []))) + json.loads(json.dumps(phase2.get("regions", [])))
    by_id = {region["id"]: region for region in regions}
    for region_id, patch in phase3.get("regionPatches", {}).items():
        region = by_id[region_id]
        region.setdefault("species", []).extend(json.loads(json.dumps(patch.get("speciesAdditions", []))))
        region.setdefault("geometry", {"habitats": [], "corridors": []})
        region["geometry"]["habitats"].extend(json.loads(json.dumps(patch.get("geometry", {}).get("habitats", []))))
        region["geometry"]["corridors"].extend(json.loads(json.dumps(patch.get("geometry", {}).get("corridors", []))))
        region["seasonalCycle"] = json.loads(json.dumps(patch.get("seasonalCycle", [])))
        region["geometrySeasonality"] = json.loads(json.dumps(patch.get("geometrySeasonality", {})))
    return regions


def validate_region(region: dict, canon_slugs: set[str], errors: list[str]) -> None:
    region_id = region.get("id")
    actual_counts = (
        len(region.get("species", [])), len(region.get("absences", [])),
        len(region.get("geometry", {}).get("habitats", [])), len(region.get("geometry", {}).get("corridors", [])),
    )
    if actual_counts != REGION_COUNTS.get(region_id):
        errors.append(f"region counts mismatch for {region_id}: {actual_counts} != {REGION_COUNTS.get(region_id)}")

    for key in ("name", "shortName", "kicker", "summary", "method", "center", "zoom", "polygon", "zones"):
        if not region.get(key): errors.append(f"missing {key}: {region_id}")
    if not coord(region.get("center")): errors.append(f"invalid center: {region_id}")
    polygon = region.get("polygon", [])
    if len(polygon) < 4 or polygon[0] != polygon[-1] or not all(coord(point) for point in polygon):
        errors.append(f"invalid region polygon: {region_id}")

    present_rows = region.get("species", [])
    present = [row.get("slug") for row in present_rows]
    duplicate_present = sorted(slug for slug, count in Counter(present).items() if count > 1)
    missing_present = sorted(set(present) - canon_slugs)
    if duplicate_present: errors.append(f"duplicate regional presence in {region_id}: {duplicate_present}")
    if missing_present: errors.append(f"non-canonical regional presence in {region_id}: {missing_present}")

    absent_rows = region.get("absences", [])
    absent = [row.get("slug") for row in absent_rows]
    duplicate_absent = sorted(slug for slug, count in Counter(absent).items() if count > 1)
    missing_absent = sorted(set(absent) - canon_slugs)
    if duplicate_absent: errors.append(f"duplicate regional absence in {region_id}: {duplicate_absent}")
    if missing_absent: errors.append(f"non-canonical regional absence in {region_id}: {missing_absent}")
    overlap = sorted(set(present) & set(absent))
    if overlap: errors.append(f"present/absent overlap in {region_id}: {overlap}")

    for row in present_rows:
        if not all(row.get(key) for key in ("slug", "presence", "frequency", "note")):
            errors.append(f"incomplete regional presence in {region_id}: {row}")
    for row in absent_rows:
        if not all(row.get(key) for key in ("slug", "status", "note")):
            errors.append(f"incomplete regional absence in {region_id}: {row}")

    geometry_ids: list[str] = []
    for kind in ("habitats", "corridors"):
        for feature in region.get("geometry", {}).get(kind, []):
            feature_id = feature.get("id")
            geometry_ids.append(feature_id)
            if not all(feature.get(key) for key in ("id", "name", "note", "color", "species")):
                errors.append(f"incomplete geometry metadata: {feature_id}")
            invalid_refs = sorted(set(feature.get("species", [])) - set(present))
            if invalid_refs: errors.append(f"geometry references non-present species in {feature_id}: {invalid_refs}")
            points = feature.get("polygon" if kind == "habitats" else "coordinates", [])
            if len(points) < (4 if kind == "habitats" else 2) or not all(coord(point) for point in points):
                errors.append(f"invalid geometry coordinates: {feature_id}")
            if kind == "habitats" and points and points[0] != points[-1]: errors.append(f"unclosed habitat polygon: {feature_id}")
            if kind == "corridors" and not feature.get("seasonal"): errors.append(f"corridor lacks seasonal description: {feature_id}")
    if len(geometry_ids) != len(set(geometry_ids)): errors.append(f"duplicate geometry IDs: {region_id}")

    cycle = region.get("seasonalCycle", [])
    cycle_months = [month for row in cycle for month in row.get("months", [])]
    if {row.get("id") for row in cycle} != {"winter", "spring", "summer", "autumn"} or sorted(cycle_months) != list(range(1, 13)):
        errors.append(f"invalid complete regional cycle: {region_id}")
    if any(not row.get("name") or not row.get("summary") for row in cycle): errors.append(f"incomplete regional cycle narrative: {region_id}")

    seasonality = region.get("geometrySeasonality", {})
    if set(seasonality) != set(geometry_ids): errors.append(f"geometry seasonality coverage mismatch: {region_id}")
    for feature_id, profile in seasonality.items():
        flat = [month for key in ("peakMonths", "activeMonths", "quietMonths") for month in profile.get(key, [])]
        if sorted(flat) != list(range(1, 13)) or len(flat) != len(set(flat)) or not profile.get("note"):
            errors.append(f"invalid geometry seasonality profile: {feature_id}")


def main() -> int:
    canon, base, phase2, phase3 = load_inputs()
    phase4 = load_phase4()
    errors: list[str] = []
    canon_slugs = {row["slug"] for row in canon.get("species", [])}

    if phase4.get("recordPolicy", {}).get("coreTier") != "Civilian Summary Record": errors.append("record policy core tier mismatch")
    if phase4.get("recordPolicy", {}).get("observationModel") != "canonical-location-specific": errors.append("observation policy mismatch")
    if {region.get("id") for region in phase4.get("regions", [])} != set(REGION_COUNTS): errors.append("Phase 4 region set mismatch")
    for region in phase4.get("regions", []): validate_region(region, canon_slugs, errors)

    region_map = {region["id"]: region for region in phase4.get("regions", [])}
    relationships = phase4.get("relationships", [])
    if len(relationships) != 8 or len({row.get("id") for row in relationships}) != 8: errors.append("Phase 4 requires eight unique relationships")
    distribution = Counter(row.get("regionId") for row in relationships)
    if distribution != Counter({region_id: 4 for region_id in REGION_COUNTS}): errors.append(f"relationship distribution mismatch: {dict(distribution)}")
    for row in relationships:
        present = {entry.get("slug") for entry in region_map.get(row.get("regionId"), {}).get("species", [])}
        invalid = sorted(set(row.get("species", [])) - present)
        if row.get("regionId") not in region_map or not row.get("species") or invalid:
            errors.append(f"invalid relationship references {row.get('id')}: {invalid}")
        if not all(row.get(key) for key in ("type", "partner", "summary", "seasonal")):
            errors.append(f"incomplete relationship: {row.get('id')}")

    combined_regions = phase3_regions(base, phase2, phase3) + phase4.get("regions", [])
    combined_relationships = phase3.get("relationships", []) + relationships
    if len(combined_regions) != 6: errors.append(f"combined region total is {len(combined_regions)}, expected 6")
    if sum(len(region.get("geometry", {}).get("habitats", [])) for region in combined_regions) != 24: errors.append("combined habitat total must be 24")
    if sum(len(region.get("geometry", {}).get("corridors", [])) for region in combined_regions) != 18: errors.append("combined corridor total must be 18")
    if len(combined_relationships) != 24: errors.append("combined relationship total must be 24")
    if len(base.get("flagshipOrder", [])) + len(phase2.get("flagshipAdditions", [])) + len(phase3.get("flagshipAdditions", [])) != 27:
        errors.append("World Completion must preserve 27 full dossiers")

    if errors:
        print("\n".join(f"ERROR: {error}" for error in errors))
        return 1
    print("GAIA World Completion Pass I validated: two semantic signatures, merged hash, two regions, 36 presences, eight habitats, six corridors, eight relationships, canon unchanged")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
