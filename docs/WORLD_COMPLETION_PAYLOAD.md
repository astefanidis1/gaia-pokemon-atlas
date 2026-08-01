# GAIA World Completion Payload Transport

World Completion Pass I (`2026-08-01.1`) is stored as **two independently signed semantic payloads**. Each semantic payload is divided into three bounded Base64 transport files so GitHub text transport cannot silently truncate one enormous encoded line.

## Semantic payload A — Central Andes and record policy

Transport files:

- `public/data/editorial/phase4.txt`
- `public/data/editorial/phase4-02.txt`
- `public/data/editorial/phase4-03.txt`

The three files concatenate into one gzip payload protected by SHA-256:

`eb1754571dc7c04e3d62f802765e5148f54ef6fd13b9e4c1820f87423c4b3941`

It contains:

- the World Completion publication and observation policy;
- the Central Andes Cloud-Forest Corridor;
- four Central Andes ecological relationships.

## Semantic payload B — East African Rift Highlands

Transport files:

- `public/data/editorial/phase4-04.txt`
- `public/data/editorial/phase4-05.txt`
- `public/data/editorial/phase4-06.txt`

The three files concatenate into a second gzip payload protected by SHA-256:

`3744e928bd8b35df9e2b8a61d02e1ff7472ff07155d5458ec312d8e66ddd5937`

It contains:

- the East African Rift Highland Mosaic;
- four Rift highland ecological relationships.

## Deterministic merge

The browser and `scripts/validate_phase4.py` decode and verify both semantic payloads independently. They must agree on:

- base ecology version `2026-07-28.2`;
- World Completion version `2026-08-01.1`.

They are then merged into the public World Completion layer. The compact merged JSON is protected by SHA-256:

`ed2e0be29dcd699bf207fb4b4bd1fd6e5cee513b4b117b748ed906dae10deed3`

The six-file transport changes delivery only. It does not change any exact population, established route, dossier, incident, or ecological statement. A damaged segment fails its own semantic checksum before the world can load.
