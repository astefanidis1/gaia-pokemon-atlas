#!/usr/bin/env python3
"""Validate GAIA World Completion Pass I without modifying signed population canon."""
from __future__ import annotations

import base64
import gzip
import hashlib
import json
from pathlib import Path

from phase3_validation_data import coord, load_inputs

ROOT = Path(__file__).resolve().parents[1]
PHASE4_PATHS = [
    ROOT / "public" / "data" / "editorial" / "phase4.txt",
    ROOT / "public" / "data" / "editorial" / "phase4-02.txt",
]
PHASE4_HASH = "9a7452d4e657ddc68f35fc57a20010267a9362b79ab18d540f71a9acf2d174d8"
PHASE4_VERSION = "2026-08-01.1"
PHASE4_BASE = "2026-07-28.2"
REGION_COUNTS = {
    "central-andes-cloud-forest-corridor": (18, 5, 4, 3),
    "east-african-rift-highland-mosaic": (18, 5, 4, 3),
}


def load_phase4() -> dict:
    encoded = "".join(path.read_text(encoding="utf-8").strip() for path in PHASE4_PATHS)
    raw = base64.b64decode(encoded, validate=True)
    actual = hashlib.sha256(raw).hexdigest()
    if actual != PHASE4_HASH:
        raise SystemExit(f"ERROR: phase 4 checksum mismatch: {actual} != {PHASE4_HASH}")
    return json.loads(gzip.decompress(raw))


def merged_phase3_regions(base: dict, phase2: dict, phase3: dict) -> list[dict]:
    rows = json.loads(json.dumps(base.get("regions", []))) + json.loads(json.dumps(phase2.get("regions", [])))
    by_id = {row["id"]: row for row in rows}
    for region_id, patch in phase3.get("regionPatches", {}).items():
        region = by_id[region_id]
        region.setdefault("species", []).extend(json.loads(json.dumps(patch.get("speciesAdditions", []))))
        region.setdefault("geometry", {"habitats": [], "corridors": []})
        region["geometry"]["habitats"].extend(json.loads(json.dumps(patch.get("geometry", {}).get("habitats", []))))
        region["geometry"]["corridors"].extend(json.loads(json.dumps(patch.get("geometry", {}).get("corridors", []))))
        region["seasonalCycle"] = json.loads(json.dumps(patch.get("seasonalCycle", [])))
        region["geometrySeasonality"] = json.loads(json.dumps(patch.get("geometrySeasonality", {})))
    return rows


def validate_region(region: dict, slugs: set[str], errors: list[str]) -> None:
    region_id = region.get("id")
    expected = REGION_COUNTS.get(region_id)
    if not expected:
        errors.append(f"unexpected phase 4 region: {region_id}")
        return
    actual = (
        len(region.get("species", [])),
        len(region.get("absences", [])),
        len(region.get("geometry", {}).get("habitats", [])),
        len(region.get("geometry", {}).get("corridors", [])),
    )
    if actual != expected:
        errors.append(f"phase 4 region counts mismatch for {region_id}: {actual} != {expected}")

    required = ("name", "shortName", "kicker", "summary", "method", "center", "zoom", "polygon", "zones")
    if any(not region.get(key) for key in required):
        errors.append(f"missing required regional metadata: {region_id}")
    if not coord(region.get("center")):
        errors.append(f"invalid region center: {region_id}")
    polygon = region.get("polygon", [])
    if len(polygon) < 4 or polygon[0] != polygon[-1] or not all(coord(point) for point in polygon):
        errors.append(f"invalid region polygon: {region_id}")

    present_rows = region.get("species", [])
    present = [row.get("slug") for row in present_rows]
    absent_rows = region.get("absences", [])
    absent = [row.get("slug") for row in absent_rows]
    if len(set(present)) != len(present) or any(slug not in slugs for slug in present):
        errors.append(f"invalid or duplicate regional presence: {region_id}")
    if len(set(absent)) != len(absent) or any(slug not in slugs for slug in absent):
        errors.append(f"invalid or duplicate regional absence: {region_id}")
    if set(present) & set(absent):
        errors.append(f"species cannot be both present and absent: {region_id}")
    for row in present_rows:
        if not all(row.get(key) for key in ("presence", "frequency", "note")):
            errors.append(f"incomplete regional presence: {region_id}/{row.get('slug')}")
    for row in absent_rows:
        if not all(row.get(key) for key in ("status", "note")):
            errors.append(f"incomplete regional absence: {region_id}/{row.get('slug')}")

    geometry = region.get("geometry", {})
    geometry_ids: list[str] = []
    for kind in ("habitats", "corridors"):
        for feature in geometry.get(kind, []):
            feature_id = feature.get("id")
            geometry_ids.append(feature_id)
            if not all(feature.get(key) for key in ("id", "name", "note", "color", "species")):
                errors.append(f"incomplete geometry metadata: {feature_id}")
            refs = feature.get("species", [])
            if not refs or any(slug not in present for slug in refs):
                errors.append(f"geometry species must be present in region: {feature_id}")
            points = feature.get("polygon" if kind == "habitats" else "coordinates", [])
            minimum = 4 if kind == "habitats" else 2
            if len(points) < minimum or not all(coord(point) for point in points):
                errors.append(f"invalid geometry coordinates: {feature_id}")
            if kind == "habitats" and points and points[0] != points[-1]:
                errors.append(f"habitat polygon must close: {feature_id}")
            if kind == "corridors" and not feature.get("seasonal"):
                errors.append(f"corridor requires seasonal description: {feature_id}")
    if len(geometry_ids) != len(set(geometry_ids)):
        errors.append(f"duplicate geometry IDs inside region: {region_id}")

    cycle = region.get("seasonalCycle", [])
    months = [month for row in cycle for month in row.get("months", [])]
    if {row.get("id") for row in cycle} != {"winter", "spring", "summer", "autumn"}:
        errors.append(f"regional cycle IDs invalid: {region_id}")
    if sorted(months) != list(range(1, 13)):
        errors.append(f"regional cycle must cover each month once: {region_id}")
    if any(not row.get("name") or not row.get("summary") for row in cycle):
        errors.append(f"regional cycle narrative incomplete: {region_id}")

    seasonality = region.get("geometrySeasonality", {})
    if set(seasonality) != set(geometry_ids):
        errors.append(f"geometry seasonality coverage mismatch: {region_id}")
    for feature_id, profile in seasonality.items():
        groups = [profile.get(key, []) for key in ("peakMonths", "activeMonths", "quietMonths")]
        flat = [month for group in groups for month in group]
        if sorted(flat) != list(range(1, 13)) or len(flat) != len(set(flat)) or not profile.get("note"):
            errors.append(f"invalid complete seasonality profile: {feature_id}")


def main() -> int:
    canon, base, phase2, phase3 = load_inputs()
    phase4 = load_phase4()
    errors: list[str] = []
    slugs = {row["slug"] for row in canon.get("species", [])}

    if (phase4.get("baseVersion"), phase4.get("version")) != (PHASE4_BASE, PHASE4_VERSION):
        errors.append("phase 4 version chain mismatch")
    policy = phase4.get("recordPolicy", {})
    if policy.get("coreTier") != "Civilian Summary Record" or policy.get("observationModel") != "canonical-location-specific":
        errors.append("World Completion record policy mismatch")
    if {region.get("id") for region in phase4.get("regions", [])} != set(REGION_COUNTS):
        errors.append("phase 4 must add exactly the two approved regions")

    for region in phase4.get("regions", []):
        validate_region(region, slugs, errors)

    relationships = phase4.get("relationships", [])
    if len(relationships) != 8 or len({row.get("id") for row in relationships}) != 8:
        errors.append("phase 4 requires eight unique relationships")
    phase4_regions = {row["id"]: row for row in phase4.get("regions", [])}
    per_region = {region_id: 0 for region_id in REGION_COUNTS}
    for row in relationships:
        region_id = row.get("regionId")
        per_region[region_id] = per_region.get(region_id, 0) + 1
        present = {entry.get("slug") for entry in phase4_regions.get(region_id, {}).get("species", [])}
        refs = row.get("species", [])
        if region_id not in phase4_regions or not refs or any(slug not in present for slug in refs):
            errors.append(f"invalid phase 4 relationship references: {row.get('id')}")
        if not all(row.get(key) for key in ("type", "partner", "summary", "seasonal")):
            errors.append(f"incomplete phase 4 relationship: {row.get('id')}")
    if any(count != 4 for count in per_region.values()):
        errors.append(f"phase 4 relationship distribution mismatch: {per_region}")

    existing_regions = merged_phase3_regions(base, phase2, phase3)
    combined_regions = existing_regions + phase4.get("regions", [])
    combined_relationships = phase3.get("relationships", []) + phase4.get("relationships", [])
    if len(combined_regions) != 6:
        errors.append("World Completion Pass I must resolve to six regional windows")
    if sum(len(row.get("geometry", {}).get("habitats", [])) for row in combined_regions) != 24:
        errors.append("World Completion Pass I must resolve to 24 habitats")
    if sum(len(row.get("geometry", {}).get("corridors", [])) for row in combined_regions) != 18:
        errors.append("World Completion Pass I must resolve to 18 corridors")
    if len(combined_relationships) != 24:
        errors.append("World Completion Pass I must resolve to 24 relationships")
    if len(base.get("flagshipOrder", [])) + len(phase2.get("flagshipAdditions", [])) + len(phase3.get("flagshipAdditions", [])) != 27:
        errors.append("World Completion Pass I must not change the 27 full dossiers")

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1
    print("GAIA World Completion Pass I validated: 2 regions, 36 presences, 8 habitats, 6 corridors, 8 relationships, canon unchanged")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
