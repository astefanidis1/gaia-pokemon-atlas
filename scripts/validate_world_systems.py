#!/usr/bin/env python3
"""Validate GAIA World Systems & Evidence Pass I and its canon boundary."""
from __future__ import annotations

import re
from pathlib import Path

from phase3_validation_data import load_inputs
from validate_phase4 import load_phase4, phase3_regions

ROOT = Path(__file__).resolve().parents[1]
MODULE = ROOT / "src" / "app" / "02h-systems-evidence.js"
CSS = ROOT / "public" / "systems-evidence.css"
VERSION = "2026-08-01.2"
errors: list[str] = []


def require(condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)


def segment(source: str, start: str, end: str) -> str:
    try:
        return source.split(start, 1)[1].split(end, 1)[0]
    except IndexError:
        errors.append(f"Unable to isolate source segment: {start} → {end}")
        return ""


def ids(source: str, prefix: str) -> list[str]:
    return re.findall(r"\bid:'(" + re.escape(prefix) + r"[^']*)'", source)


def array_values(source: str, key: str) -> list[str]:
    values: list[str] = []
    for body in re.findall(rf"\b{re.escape(key)}:\[(.*?)\]", source, re.S):
        values.extend(re.findall(r"'([^']+)'", body))
    return values


def main() -> int:
    source = MODULE.read_text(encoding="utf-8")
    css = CSS.read_text(encoding="utf-8")
    canon, base, phase2, phase3 = load_inputs()
    phase4 = load_phase4()

    system_source = segment(source, "const gaiaWorldSystems=[", "const gaiaEvidenceRecords=[")
    evidence_source = segment(source, "const gaiaEvidenceRecords=[", "const gaiaLineagePilots=[")
    lineage_source = segment(source, "const gaiaLineagePilots=[", "const gaiaSystemIncidentDrafts=[")
    incident_source = segment(source, "const gaiaSystemIncidentDrafts=[", "const gaiaSystemIncidents=")

    system_ids = re.findall(r"\bid:'([^']+)'", system_source)
    evidence_ids = re.findall(r"\bid:'([^']+)'", evidence_source)
    lineage_ids = re.findall(r"\bid:'([^']+)'", lineage_source)
    incident_ids = re.findall(r"\bid:'([^']+)'", incident_source)

    require(f"GAIA_WORLD_SYSTEMS_VERSION='{VERSION}'" in source, "World Systems version marker is missing")
    require(len(system_ids) == 8 and len(set(system_ids)) == 8, f"Expected 8 unique world systems, found {len(system_ids)}")
    require(len(evidence_ids) == 9 and len(set(evidence_ids)) == 9, f"Expected 9 unique evidence records, found {len(evidence_ids)}")
    require(len(lineage_ids) == 3 and len(set(lineage_ids)) == 3, f"Expected 3 unique lineage pilots, found {len(lineage_ids)}")
    require(len(incident_ids) == 8 and len(set(incident_ids)) == 8, f"Expected 8 unique system investigations, found {len(incident_ids)}")

    canon_slugs = {row["slug"] for row in canon.get("species", [])}
    species_refs = set(array_values(system_source, "species") + array_values(evidence_source, "species") + array_values(incident_source, "species"))
    species_refs.update(re.findall(r"anchorSlug:'([^']+)'", lineage_source))
    missing_species = sorted(species_refs - canon_slugs)
    require(not missing_species, f"World Systems references species outside the signed 161-species canon: {missing_species}")

    existing_regions = phase3_regions(base, phase2, phase3) + phase4.get("regions", [])
    region_ids = {row["id"] for row in existing_regions}
    region_refs = set(array_values(system_source, "regions"))
    region_refs.update(value for value in re.findall(r"regionId:(?:'([^']*)'|null)", evidence_source) if value)
    missing_regions = sorted(region_refs - region_ids)
    require(not missing_regions, f"World Systems references unknown regions: {missing_regions}")

    system_refs = set(array_values(evidence_source, "systemIds") + array_values(incident_source, "systemIds") + array_values(lineage_source, "systems"))
    require(not sorted(system_refs - set(system_ids)), f"Unknown system cross-references: {sorted(system_refs - set(system_ids))}")
    evidence_refs = set(array_values(incident_source, "evidenceIds") + array_values(lineage_source, "evidence"))
    require(not sorted(evidence_refs - set(evidence_ids)), f"Unknown evidence cross-references: {sorted(evidence_refs - set(evidence_ids))}")
    incident_refs = set(array_values(system_source, "incidents"))
    incident_refs.update(value for value in re.findall(r"incidentId:(?:'([^']*)'|null)", evidence_source) if value)
    require(not sorted(incident_refs - set(incident_ids)), f"Unknown investigation cross-references: {sorted(incident_refs - set(incident_ids))}")

    prohibited = ("species.push(", "populations.push(", "locations.push(", "forms.push(", "routes.push(")
    for marker in prohibited:
        require(marker not in source, f"World Systems must not mutate signed canon through {marker}")
    require("incidents.push(record)" in source, "System investigations are not integrated into the existing incident archive")
    require("Stage-specific census integration pending lineage expansion" in source, "Lineage pilots must not publish provisional stage totals")
    require("gaiaEvidenceSVG" in source and "<svg" in source, "Original institutional evidence renderer is missing")
    require("http://" not in evidence_source and "https://" not in evidence_source, "Evidence plates must not depend on remote image URLs")

    for marker in (
        "WORLD SYSTEMS", "GAIA EVIDENCE ARCHIVE", "INVESTIGATION CHAINS", "EVOLUTIONARY FAMILY PILOTS",
        "worldSystemModal", "system=", "evidence=", "lineage=", "investigation=",
        "INSTITUTIONAL WORLD CONTEXT", "REGIONAL INSTITUTIONS & EVIDENCE"
    ):
        require(marker in source, f"World Systems interface is missing: {marker}")

    for selector in (
        ".world-systems-grid", ".evidence-archive-grid", ".investigation-chain-grid", ".lineage-pilot-grid",
        ".systems-modal-card", ".evidence-detail-plate", ".lineage-stage-list", ".dossier-world-systems",
        ".region-world-systems"
    ):
        require(selector in css, f"World Systems styling is missing: {selector}")

    if errors:
        print("\n".join(f"ERROR: {error}" for error in errors))
        return 1

    print(
        "GAIA World Systems & Evidence Pass I validated: 8 systems, 9 original evidence plates, "
        "8 investigations, 3 lineage pilots, all references inside signed canon, no population mutation"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
