#!/usr/bin/env python3
"""Print focused Phase 4 species-reference diagnostics for CI debugging."""
from phase3_validation_data import load_inputs
from validate_phase4 import load_phase4

canon, _, _, _ = load_inputs()
phase4 = load_phase4()
print('CANON SLUGS:')
print(','.join(sorted(row.get('slug','') for row in canon.get('species', []))))
print('PHASE 4 REGIONAL PRESENCES:')
for region in phase4.get('regions', []):
    print(region.get('id'), [entry.get('slug') for entry in region.get('species', [])])
