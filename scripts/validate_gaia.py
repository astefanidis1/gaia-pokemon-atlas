#!/usr/bin/env python3
"""Validate the canonical GAIA browser dataset before deployment."""
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
EXPECTED_PAYLOAD_SHA256 = "0028c6891e6c31988a3a4a6957867fccfab4f6bc1e321f43ec8e68fc22c4ca95"
EXPECTED_CORRECTION_VERSION = "2026-07-27.1"

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

if errors:
    print("\n".join(f"ERROR: {error}" for error in errors))
    raise SystemExit(1)

print(
    "GAIA validation passed: "
    f"{len(species)} species, {len(forms)} forms, "
    f"{len(populations)} populations, {len(locations)} locations, "
    f"{len(routes)} live routes, {len(incidents)} incidents, "
    f"corrections {corrections['version']}"
)
