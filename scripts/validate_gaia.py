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
CHUNKS = ROOT / "public" / "data" / "canon"
EXPECTED_PAYLOAD_SHA256 = "0028c6891e6c31988a3a4a6957867fccfab4f6bc1e321f43ec8e68fc22c4ca95"

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

species_ids = {row["id"] for row in species}
form_ids = {row["id"] for row in forms}
location_ids = {row["id"] for row in locations}
population_sum: defaultdict[str, int] = defaultdict(int)
location_count: defaultdict[str, int] = defaultdict(int)

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
    if location["realm"] == "Earth" and not all(
        isinstance(location.get(field), (int, float)) for field in ("lat", "lon")
    ):
        errors.append(f"{location['id']} is missing Earth coordinates")

for route in routes:
    if route["speciesId"] not in species_ids:
        errors.append(f"route {route['id']} references missing species")
    if len(route.get("waypoints", [])) < 2:
        errors.append(f"route {route['id']} has too few waypoints")

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
    f"{len(routes)} live routes, {len(incidents)} incidents"
)
