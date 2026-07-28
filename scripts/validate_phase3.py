#!/usr/bin/env python3
"""Run GAIA ecology integration phase 3 validation."""
from phase3_validation_checks import validate
errors = validate()
if errors:
    print("\n".join(f"ERROR: {item}" for item in errors))
    raise SystemExit(1)
print("GAIA phase 3 validation passed: 6 dossiers, 4 seasonal regions, 16 habitats, 12 corridors, 16 relationships; combined total 27 dossiers.")
