#!/usr/bin/env python3
"""Validate canonical, editorial, regional, and public-build GAIA data."""
from __future__ import annotations

import base64
import gzip
import hashlib
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_ROOT = ROOT / "public" / "data"
CHUNKS = DATA_ROOT / "canon"
CORRECTIONS_PATH = DATA_ROOT / "canon-corrections.json"
EDITORIAL_CHUNKS = DATA_ROOT / "editorial"
EXPECTED_EDITORIAL_SHA256 = "6d5feae44a2c06f7d8bd0de644d303c814b22a0cf845602098263332e2b2614c"
EXPECTED_PAYLOAD_SHA256 = "0028c6891e6c31988a3a4a6957867fccfab4f6bc1e321f43ec8e68fc22c4ca95"
EXPECTED_CORRECTION_VERSION = "2026-07-27.1"
EXPECTED_EDITORIAL_VERSION = "2026-07-27.1"

encoded = "".join(
    (CHUNKS / f"chunk-{index:02d}.txt").read_text(encoding="utf-8").strip()
    for index in range(1, 8)
)
compressed = base64.b64decode(encoded, validate=True)
actual_hash = hashlib.sha256(compressed).hexdigest()
if actual_hash != EXPECTED_PAYLOAD_SHA256:
    raise SystemExit(
        f"ERROR: canon payload checksum mismatch: {actual_hash} != {EXPECTED_PAYLOAD_SHA256}"
    )

data = json.loads(gzip.decompress(compressed))
corrections = json.loads(CORRECTIONS_PATH.read_text(encoding="utf-8"))
editorial_encoded = "".join(
    (EDITORIAL_CHUNKS / f"chunk-{index:02d}.txt").read_text(encoding="utf-8").strip()
    for index in range(1, 4)
)
editorial_compressed = base64.b64decode(editorial_encoded, validate=True)
editorial_hash = hashlib.sha256(editorial_compressed).hexdigest()
if editorial_hash != EXPECTED_EDITORIAL_SHA256:
    raise SystemExit(
        f"ERROR: editorial payload checksum mismatch: {editorial_hash} != {EXPECTED_EDITORIAL_SHA256}"
    )
editorial = json.loads(gzip.decompress(editorial_compressed))
species = data["species"]
forms = data["forms"]
populations = data["populations"]
locations = data["locations"]
routes = data["routes"]
incidents = data["incidents"]
errors: list[str] = []


def unique(rows: list[dict], key: str, label: str) -> None:
    seen: set[object] = set()
    duplicates: set[object] = set()
    for row in rows:
        value = row[key]
        if value in seen:
            duplicates.add(value)
        seen.add(value)
    if duplicates:
        errors.append(f"duplicate {label}: {sorted(duplicates)}")


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
        "canon correction version mismatch: "
        f"{corrections.get('version')} != {EXPECTED_CORRECTION_VERSION}"
    )

allowed_correction_fields = {"knowledgeStatus"}
for species_id, patch in corrections.get("species", {}).items():
    species_row = species_by_id.get(species_id)
    if not species_row:
        errors.append(f"canon correction references missing species {species_id}")
        continue
    unexpected_fields = set(patch) - allowed_correction_fields
    if unexpected_fields:
        errors.append(
            f"canon correction for {species_id} uses unsupported fields: "
            f"{sorted(unexpected_fields)}"
        )
    species_row.update(patch)

required_species_fields = (
    "id",
    "dex",
    "slug",
    "name",
    "category",
    "globalPopulation",
    "censusVerified",
    "accessStatus",
    "knowledgeStatus",
)

for row in species:
    for field in required_species_fields:
        if field not in row:
            errors.append(f"{row.get('name', '?')} missing {field}")
    if not isinstance(row.get("globalPopulation"), int) or row["globalPopulation"] < 1:
        errors.append(f"{row.get('name', '?')} has an invalid global population")

for form in forms:
    if form["speciesId"] not in species_ids:
        errors.append(f"form {form['id']} references missing species")
    for location_id in form.get("locationIds", []):
        if location_id not in location_ids:
            errors.append(f"form {form['id']} references missing location {location_id}")

for population in populations:
    species_id = population["speciesId"]
    if species_id not in species_ids:
        errors.append(f"population {population['id']} references missing species")
    if population.get("formId") and population["formId"] not in form_ids:
        errors.append(f"population {population['id']} references missing form")
    if not isinstance(population.get("count"), int) or population["count"] < 1:
        errors.append(f"population {population['id']} has an invalid count")
    population_sum[species_id] += population["count"]
    for location_id in population.get("locationIds", []):
        if location_id not in location_ids:
            errors.append(
                f"population {population['id']} references missing location {location_id}"
            )

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
    route_species = species_by_id[species_id]
    if route_species.get("knowledgeStatus") != "Actively Tracked":
        errors.append(
            f"{route_species['name']} has a canonical route but is not Actively Tracked"
        )
    if not any(
        location.get("locationType") == "Current confirmed position"
        for location in locations_by_species[species_id]
    ):
        errors.append(
            f"{route_species['name']} has a canonical route without a current confirmed position"
        )

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

expected_counts = {
    "species": 161,
    "forms": 2,
    "populations": 162,
    "locations": 162,
    "routes": 5,
    "incidents": 3,
}
actual_counts = {key: len(data[key]) for key in expected_counts}
for key, expected in expected_counts.items():
    if actual_counts[key] != expected:
        errors.append(f"expected {expected} {key}, found {actual_counts[key]}")

# Editorial and regional layers are versioned separately from signed population canon.
if editorial.get("version") != EXPECTED_EDITORIAL_VERSION:
    errors.append(
        f"editorial version mismatch: {editorial.get('version')} != {EXPECTED_EDITORIAL_VERSION}"
    )

flagships = editorial.get("flagshipOrder", [])
if len(flagships) != 12 or len(set(flagships)) != 12:
    errors.append("editorial flagshipOrder must contain exactly 12 unique species slugs")

editorial_dossiers = editorial.get("dossiers", {})
for slug in flagships:
    if slug not in species_by_slug:
        errors.append(f"flagship dossier references missing species slug {slug}")
    if slug not in editorial_dossiers:
        errors.append(f"flagship species {slug} is missing editorial dossier content")

for slug, dossier in editorial_dossiers.items():
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
for region in regions:
    region_id = region.get("id", "?")
    if region.get("realm") != "Earth":
        errors.append(f"regional field window {region_id} must currently use the Earth realm")
    center = region.get("center", [])
    if len(center) != 2 or not all(isinstance(value, (int, float)) for value in center):
        errors.append(f"regional field window {region_id} has an invalid center")
    polygon = region.get("polygon", [])
    if len(polygon) < 4 or polygon[0] != polygon[-1]:
        errors.append(f"regional field window {region_id} polygon must be closed")
    present_slugs = [entry.get("slug") for entry in region.get("species", [])]
    absent_slugs = [entry.get("slug") for entry in region.get("absences", [])]
    if len(present_slugs) != len(set(present_slugs)):
        errors.append(f"regional field window {region_id} repeats a present species")
    if len(absent_slugs) != len(set(absent_slugs)):
        errors.append(f"regional field window {region_id} repeats an absence")
    overlap = set(present_slugs) & set(absent_slugs)
    if overlap:
        errors.append(f"regional field window {region_id} marks species both present and absent: {sorted(overlap)}")
    for slug in present_slugs + absent_slugs:
        if slug not in species_by_slug:
            errors.append(f"regional field window {region_id} references missing species slug {slug}")

new_england = next((region for region in regions if region.get("id") == "new-england"), None)
if not new_england:
    errors.append("the launch editorial layer requires the new-england field window")
else:
    if len(new_england.get("species", [])) != 12:
        errors.append("new-england field window must contain 12 documented presences")
    if len(new_england.get("absences", [])) != 4:
        errors.append("new-england field window must contain four explicit absences")

if errors:
    print("\n".join(f"ERROR: {error}" for error in errors))
    raise SystemExit(1)

print(
    "GAIA validation passed: "
    f"{len(species)} species, {len(forms)} forms, "
    f"{len(populations)} populations, {len(locations)} locations, "
    f"{len(routes)} live routes, {len(incidents)} incidents, "
    f"{len(flagships)} flagship dossiers, {len(regions)} regional field window, "
    f"corrections {corrections['version']}, editorial {editorial['version']}"
)
