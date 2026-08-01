# GAIA World Completion Payload Transport

World Completion Pass I (`2026-08-01.1`) is stored as two small Base64 transport chunks:

- `public/data/editorial/phase4.txt`
- `public/data/editorial/phase4-02.txt`

The browser and `scripts/validate_phase4.py` concatenate the chunks before decoding. The reconstructed gzip payload is protected by SHA-256 `9a7452d4e657ddc68f35fc57a20010267a9362b79ab18d540f71a9acf2d174d8` and remains chained to ecology version `2026-07-28.2`.

The split changes transport only. It does not change the Phase 4 JSON, any exact population, or any published ecological statement.
