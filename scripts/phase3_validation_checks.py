"""Structural checks for GAIA ecology integration phase 3."""
from __future__ import annotations
import json
from phase3_validation_data import ADDITIONS, COUNTS, DOSSIERS, VERSIONS, coord, dossier_ok, load_inputs

def validate() -> list[str]:
    canon, base, phase2, phase3 = load_inputs()
    slugs = {row["slug"] for row in canon["species"]}
    errors: list[str] = []
    if base.get("version") != VERSIONS["base"]: errors.append("editorial base version mismatch")
    if (phase2.get("baseVersion"), phase2.get("version")) != (VERSIONS["base"], VERSIONS["phase2"]): errors.append("phase 2 version chain mismatch")
    if (phase3.get("baseVersion"), phase3.get("version")) != (VERSIONS["phase2"], VERSIONS["phase3"]): errors.append("phase 3 version chain mismatch")
    if set(phase3.get("flagshipAdditions", [])) != DOSSIERS or set(phase3.get("dossiers", {})) != DOSSIERS: errors.append("phase 3 dossier set mismatch")
    for slug, item in phase3.get("dossiers", {}).items():
        if slug not in slugs or not dossier_ok(item): errors.append(f"invalid phase 3 dossier: {slug}")
    region_rows = json.loads(json.dumps(base.get("regions", []))) + json.loads(json.dumps(phase2.get("regions", [])))
    regions = {row["id"]: row for row in region_rows}
    patches = phase3.get("regionPatches", {})
    if set(patches) != set(ADDITIONS): errors.append("phase 3 must patch exactly four regions")
    geometry_ids = {g["id"] for r in region_rows for kind in ("habitats", "corridors") for g in r.get("geometry", {}).get(kind, [])}
    for region_id, patch in patches.items():
        region = regions.get(region_id)
        if not region:
            errors.append(f"missing patched region: {region_id}"); continue
        additions = patch.get("speciesAdditions", [])
        if len(additions) != ADDITIONS[region_id] or len({x.get("slug") for x in additions}) != ADDITIONS[region_id]: errors.append(f"bad additions: {region_id}")
        existing = {x.get("slug") for x in region.get("species", [])}
        for row in additions:
            if row.get("slug") not in slugs or row.get("slug") in existing: errors.append(f"invalid added species in {region_id}: {row.get('slug')}")
        region["species"].extend(additions)
        region.setdefault("geometry", {"habitats": [], "corridors": []})
        for kind in ("habitats", "corridors"):
            for item in patch.get("geometry", {}).get(kind, []):
                gid = item.get("id")
                if not gid or gid in geometry_ids: errors.append(f"duplicate geometry ID: {gid}")
                geometry_ids.add(gid)
                points = item.get("polygon" if kind == "habitats" else "coordinates", [])
                minimum = 4 if kind == "habitats" else 2
                if len(points) < minimum or not all(coord(p) for p in points) or (kind == "habitats" and points[0] != points[-1]): errors.append(f"invalid geometry: {gid}")
                if (kind == "corridors" and not item.get("seasonal")) or any(s not in slugs for s in item.get("species", [])): errors.append(f"invalid geometry metadata: {gid}")
            region["geometry"][kind].extend(patch.get("geometry", {}).get(kind, []))
        cycle = patch.get("seasonalCycle", [])
        months = [m for row in cycle for m in row.get("months", [])]
        if {row.get("id") for row in cycle} != {"winter", "spring", "summer", "autumn"} or sorted(months) != list(range(1, 13)): errors.append(f"invalid seasonal cycle: {region_id}")
        seasonality = patch.get("geometrySeasonality", {})
        ids = {g["id"] for kind in ("habitats", "corridors") for g in region["geometry"][kind]}
        if set(seasonality) != ids: errors.append(f"seasonality coverage mismatch: {region_id}")
        for gid, profile in seasonality.items():
            groups = [profile.get(k, []) for k in ("peakMonths", "activeMonths", "quietMonths")]
            flat = [m for group in groups for m in group]
            if len(flat) != len(set(flat)) or any(not isinstance(m, int) or not 1 <= m <= 12 for m in flat) or not profile.get("note"): errors.append(f"bad seasonality profile: {gid}")
        region["seasonalCycle"] = cycle
        region["geometrySeasonality"] = seasonality
    for region_id, expected in COUNTS.items():
        r = regions[region_id]
        actual = (len(r.get("species", [])), len(r.get("absences", [])), len(r.get("geometry", {}).get("habitats", [])), len(r.get("geometry", {}).get("corridors", [])))
        if actual != expected: errors.append(f"final counts mismatch for {region_id}: {actual} != {expected}")
    relationships = phase3.get("relationships", [])
    if len(relationships) != 16 or len({r.get("id") for r in relationships}) != 16: errors.append("phase 3 requires 16 unique relationships")
    per_region = {key: 0 for key in ADDITIONS}
    for row in relationships:
        region_id = row.get("regionId"); per_region[region_id] = per_region.get(region_id, 0) + 1
        present = {x.get("slug") for x in regions.get(region_id, {}).get("species", [])}
        refs = row.get("species", [])
        if region_id not in regions or not refs or any(s not in slugs or s not in present for s in refs) or not all(row.get(k) for k in ("type", "partner", "summary", "seasonal")): errors.append(f"invalid relationship: {row.get('id')}")
    if any(value != 4 for value in per_region.values()): errors.append(f"relationship distribution mismatch: {per_region}")
    full = base.get("flagshipOrder", []) + phase2.get("flagshipAdditions", []) + phase3.get("flagshipAdditions", [])
    if len(full) != 27 or len(set(full)) != 27: errors.append("combined layer must resolve to 27 unique full dossiers")
    if sum(len(r.get("geometry", {}).get("habitats", [])) for r in regions.values()) != 16: errors.append("combined layer must resolve to 16 habitats")
    if sum(len(r.get("geometry", {}).get("corridors", [])) for r in regions.values()) != 12: errors.append("combined layer must resolve to 12 corridors")
    return errors
