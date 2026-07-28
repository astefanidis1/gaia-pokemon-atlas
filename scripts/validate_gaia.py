#!/usr/bin/env python3
"""Validate GAIA canon, editorial depth, regional ecology, and map geometry."""
from __future__ import annotations

import base64
import gzip
import hashlib
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_ROOT = ROOT / "public" / "data"
CANON_CHUNKS = DATA_ROOT / "canon"
EDITORIAL_CHUNKS = DATA_ROOT / "editorial"
CORRECTIONS_PATH = DATA_ROOT / "canon-corrections.json"

EXPECTED_CANON_SHA256 = "0028c6891e6c31988a3a4a6957867fccfab4f6bc1e321f43ec8e68fc22c4ca95"
EXPECTED_EDITORIAL_SHA256 = "34cdfbf7233474b45a23906f18dbb48960fe97d6ee778d9c2e3aa294ea918374"
EXPECTED_CORRECTION_VERSION = "2026-07-27.1"
EXPECTED_EDITORIAL_VERSION = "2026-07-27.2"
EXPECTED_COUNTS = {
    "species": 161,
    "forms": 2,
    "populations": 162,
    "locations": 162,
    "routes": 5,
    "incidents": 3,
}

errors: list[str] = []


def load_payload(directory: Path, count: int, expected_hash: str, label: str) -> dict:
    encoded = "".join(
        (directory / f"chunk-{index:02d}.txt").read_text(encoding="utf-8").strip()
        for index in range(1, count + 1)
    )
    compressed = base64.b64decode(encoded, validate=True)
    actual_hash = hashlib.sha256(compressed).hexdigest()
    if actual_hash != expected_hash:
        errors.append(f"{label} payload checksum mismatch: {actual_hash} != {expected_hash}")
    return json.loads(gzip.decompress(compressed))


def unique(rows: list[dict], key: str, label: str) -> None:
    seen: set[object] = set()
    duplicates: set[object] = set()
    for row in rows:
        value = row.get(key)
        if value in seen:
            duplicates.add(value)
        seen.add(value)
    if duplicates:
        errors.append(f"duplicate {label}: {sorted(duplicates)}")


def valid_coordinate(value: object) -> bool:
    return (
        isinstance(value, list)
        and len(value) == 2
        and all(isinstance(axis, (int, float)) for axis in value)
        and -180 <= value[0] <= 180
        and -90 <= value[1] <= 90
    )


def validate_closed_polygon(points: object, label: str) -> None:
    if not isinstance(points, list) or len(points) < 4:
        errors.append(f"{label} must contain at least four coordinates")
        return
    if not all(valid_coordinate(point) for point in points):
        errors.append(f"{label} contains invalid coordinates")
    if points[0] != points[-1]:
        errors.append(f"{label} must be closed")


data = load_payload(CANON_CHUNKS, 7, EXPECTED_CANON_SHA256, "canon")
editorial = load_payload(EDITORIAL_CHUNKS, 4, EXPECTED_EDITORIAL_SHA256, "editorial")
corrections = json.loads(CORRECTIONS_PATH.read_text(encoding="utf-8"))

species = data["species"]
forms = data["forms"]
populations = data["populations"]
locations = data["locations"]
routes = data["routes"]
incidents = data["incidents"]

for key, expected in EXPECTED_COUNTS.items():
    actual = len(data[key])
    if actual != expected:
        errors.append(f"expected {expected} {key}, found {actual}")

for rows, key, label in (
    (species, "id", "species IDs"),
    (species, "slug", "species slugs"),
    (forms, "id", "form IDs"),
    (populations, "id", "population IDs"),
    (locations, "id", "location IDs"),
    (routes, "id", "route IDs"),
    (incidents, "id", "incident IDs"),
):
    unique(rows, key, label)

species_by_id = {row["id"]: row for row in species}
species_by_slug = {row["slug"]: row for row in species}
species_ids = set(species_by_id)
form_ids = {row["id"] for row in forms}
location_ids = {row["id"] for row in locations}
population_sum: defaultdict[str, int] = defaultdict(int)
location_count: defaultdict[str, int] = defaultdict(int)
locations_by_species: defaultdict[str, list[dict]] = defaultdict(list)

if corrections.get("version") != EXPECTED_CORRECTION_VERSION:
    errors.append(
        f"canon correction version mismatch: {corrections.get('version')} != "
        f"{EXPECTED_CORRECTION_VERSION}"
    )

allowed_correction_fields = {"knowledgeStatus"}
for species_id, patch in corrections.get("species", {}).items():
    row = species_by_id.get(species_id)
    if row is None:
        errors.append(f"canon correction references missing species {species_id}")
        continue
    unexpected = set(patch) - allowed_correction_fields
    if unexpected:
        errors.append(f"canon correction for {species_id} uses unsupported fields: {sorted(unexpected)}")
    row.update(patch)

for form in forms:
    if form["speciesId"] not in species_ids:
        errors.append(f"form {form['id']} references missing species")
    if form.get("locationIds"):
        for location_id in form["locationIds"]:
            if location_id not in location_ids:
                errors.append(f"form {form['id']} references missing location {location_id}")

for population in populations:
    species_id = population["speciesId"]
    if species_id not in species_ids:
        errors.append(f"population {population['id']} references missing species")
    if population.get("formId") and population["formId"] not in form_ids:
        errors.append(f"population {population['id']} references missing form")
    count = population.get("count")
    if not isinstance(count, int) or count < 1:
        errors.append(f"population {population['id']} has an invalid count")
    population_sum[species_id] += int(count or 0)
    for location_id in population.get("locationIds", []):
        if location_id not in location_ids:
            errors.append(f"population {population['id']} references missing location {location_id}")

for location in locations:
    species_id = location["speciesId"]
    if species_id not in species_ids:
        errors.append(f"location {location['id']} references missing species")
    if location.get("formId") and location["formId"] not in form_ids:
        errors.append(f"location {location['id']} references missing form")
    location_count[species_id] += 1
    locations_by_species[species_id].append(location)
    if location["realm"] == "Earth" and not all(
        isinstance(location.get(field), (int, float)) for field in ("lat", "lon")
    ):
        errors.append(f"{location['id']} is missing Earth coordinates")

for route in routes:
    species_id = route["speciesId"]
    if species_id not in species_ids:
        errors.append(f"route {route['id']} references missing species")
        continue
    if len(route.get("waypoints", [])) < 2:
        errors.append(f"route {route['id']} has too few waypoints")
    row = species_by_id[species_id]
    if row.get("knowledgeStatus") != "Actively Tracked":
        errors.append(f"{row['name']} has a canonical route but is not Actively Tracked")
    if not any(
        location.get("locationType") == "Current confirmed position"
        for location in locations_by_species[species_id]
    ):
        errors.append(f"{row['name']} has a canonical route without a current confirmed position")

for incident in incidents:
    for species_id in incident.get("speciesIds", []):
        if species_id not in species_ids:
            errors.append(f"incident {incident['id']} references missing species")

for row in species:
    species_id = row["id"]
    if population_sum[species_id] != row["globalPopulation"]:
        errors.append(
            f"{row['name']} population reconciliation failed: "
            f"{population_sum[species_id]} != {row['globalPopulation']}"
        )
    if location_count[species_id] < 1:
        errors.append(f"{row['name']} has no location record")

if editorial.get("version") != EXPECTED_EDITORIAL_VERSION:
    errors.append(
        f"editorial version mismatch: {editorial.get('version')} != "
        f"{EXPECTED_EDITORIAL_VERSION}"
    )

flagships = editorial.get("flagshipOrder", [])
if len(flagships) != 15 or len(set(flagships)) != 15:
    errors.append("editorial flagshipOrder must contain exactly 15 unique species slugs")

dossiers = editorial.get("dossiers", {})
for slug in flagships:
    if slug not in species_by_slug:
        errors.append(f"flagship dossier references missing species slug {slug}")
    if slug not in dossiers:
        errors.append(f"flagship species {slug} is missing editorial dossier content")

for slug, dossier in dossiers.items():
    if slug not in species_by_slug:
        errors.append(f"editorial dossier references missing species slug {slug}")
        continue
    if len(dossier.get("sections", [])) < 2:
        errors.append(f"editorial dossier {slug} requires at least two added sections")
    if len(dossier.get("archives", [])) < 2:
        errors.append(f"editorial dossier {slug} requires at least two archive records")
    note = dossier.get("founderNote", {})
    for field in ("author", "role", "text"):
        if not note.get(field):
            errors.append(f"editorial dossier {slug} founder note missing {field}")
    if not dossier.get("advisory"):
        errors.append(f"editorial dossier {slug} is missing a public advisory")

regions = editorial.get("regions", [])
unique(regions, "id", "regional field-window IDs")
if len(regions) != 2:
    errors.append(f"world-density phase 1 requires exactly two regional windows, found {len(regions)}")

for region in regions:
    region_id = region.get("id", "?")
    if region.get("realm") != "Earth":
        errors.append(f"regional field window {region_id} must use the Earth realm")
    if not valid_coordinate(region.get("center")):
        errors.append(f"regional field window {region_id} has an invalid center")
    validate_closed_polygon(region.get("polygon"), f"regional field window {region_id} polygon")

    present = [entry.get("slug") for entry in region.get("species", [])]
    absent = [entry.get("slug") for entry in region.get("absences", [])]
    if len(present) != len(set(present)):
        errors.append(f"regional field window {region_id} repeats a present species")
    if len(absent) != len(set(absent)):
        errors.append(f"regional field window {region_id} repeats an absence")
    overlap = set(present) & set(absent)
    if overlap:
        errors.append(f"regional field window {region_id} marks species both present and absent: {sorted(overlap)}")
    for slug in present + absent:
        if slug not in species_by_slug:
            errors.append(f"regional field window {region_id} references missing species slug {slug}")

    geometry = region.get("geometry", {})
    habitats = geometry.get("habitats", [])
    corridors = geometry.get("corridors", [])
    unique(habitats, "id", f"{region_id} habitat IDs")
    unique(corridors, "id", f"{region_id} corridor IDs")
    for habitat in habitats:
        habitat_id = habitat.get("id", "?")
        validate_closed_polygon(
            habitat.get("polygon"),
            f"regional field window {region_id} habitat {habitat_id}",
        )
        for slug in habitat.get("species", []):
            if slug not in species_by_slug:
                errors.append(f"{region_id} habitat {habitat_id} references missing species {slug}")
    for corridor in corridors:
        corridor_id = corridor.get("id", "?")
        coordinates = corridor.get("coordinates", [])
        if not isinstance(coordinates, list) or len(coordinates) < 2:
            errors.append(f"{region_id} corridor {corridor_id} requires at least two coordinates")
        elif not all(valid_coordinate(point) for point in coordinates):
            errors.append(f"{region_id} corridor {corridor_id} contains invalid coordinates")
        for slug in corridor.get("species", []):
            if slug not in species_by_slug:
                errors.append(f"{region_id} corridor {corridor_id} references missing species {slug}")

required_regions = {
    "new-england": (12, 4, 0, 0),
    "aegean-eastern-mediterranean": (18, 6, 4, 3),
}
for region_id, expected in required_regions.items():
    region = next((row for row in regions if row.get("id") == region_id), None)
    if region is None:
        errors.append(f"missing required regional field window {region_id}")
        continue
    actual = (
        len(region.get("species", [])),
        len(region.get("absences", [])),
        len(region.get("geometry", {}).get("habitats", [])),
        len(region.get("geometry", {}).get("corridors", [])),
    )
    if actual != expected:
        errors.append(f"{region_id} counts {actual} do not match expected {expected}")

if errors:
    print("\n".join(f"ERROR: {error}" for error in errors))
    raise SystemExit(1)

print(
    "GAIA validation passed: "
    f"{len(species)} species, {len(forms)} forms, {len(populations)} populations, "
    f"{len(locations)} locations, {len(routes)} live routes, {len(incidents)} incidents, "
    f"{len(flagships)} full dossiers, {len(regions)} regional windows, "
    f"editorial {editorial['version']}"
)
