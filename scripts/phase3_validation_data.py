"""Signed inputs and helpers for GAIA ecology integration validation."""
from __future__ import annotations
import base64, gzip, hashlib, json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "public" / "data"
EDITORIAL = DATA / "editorial"
CANON = DATA / "canon"
HASHES = {
    "canon": "0028c6891e6c31988a3a4a6957867fccfab4f6bc1e321f43ec8e68fc22c4ca95",
    "base": "34cdfbf7233474b45a23906f18dbb48960fe97d6ee778d9c2e3aa294ea918374",
    "phase2": "473ec4e84a08e0b2ed08f529fe608132f56d09728597f8144e04546286cf7f37",
    "phase3": "26bb1d85fc95ae4b370984097e5aaa8e78efb4a3360b1e18e15462eece002db7",
}
VERSIONS = {"base": "2026-07-27.2", "phase2": "2026-07-28.1", "phase3": "2026-07-28.2"}
DOSSIERS = {"sylveon", "poliwrath", "golem", "luxray", "vaporeon", "togekiss"}
ADDITIONS = {
    "new-england": 5,
    "aegean-eastern-mediterranean": 1,
    "pacific-northwest-temperate-rainforest": 3,
    "central-honshu-urban-mountain-corridor": 3,
}
COUNTS = {
    "new-england": (17, 4, 4, 3),
    "aegean-eastern-mediterranean": (19, 6, 4, 3),
    "pacific-northwest-temperate-rainforest": (21, 6, 4, 3),
    "central-honshu-urban-mountain-corridor": (21, 6, 4, 3),
}
def payload(encoded: str, expected: str, label: str) -> dict:
    raw = base64.b64decode(encoded, validate=True)
    actual = hashlib.sha256(raw).hexdigest()
    if actual != expected:
        raise SystemExit(f"ERROR: {label} checksum mismatch: {actual} != {expected}")
    return json.loads(gzip.decompress(raw))
def chunks(folder: Path, count: int) -> str:
    return "".join((folder / f"chunk-{i:02d}.txt").read_text().strip() for i in range(1, count + 1))
def coord(point: object) -> bool:
    return isinstance(point, list) and len(point) == 2 and all(isinstance(v, (int, float)) for v in point) and -180 <= point[0] <= 180 and -90 <= point[1] <= 90
def dossier_ok(item: dict) -> bool:
    note = item.get("founderNote", {})
    return len(item.get("sections", [])) >= 2 and len(item.get("archives", [])) >= 2 and bool(item.get("advisory")) and all(note.get(k) for k in ("author", "role", "text"))
def load_inputs():
    canon = payload(chunks(CANON, 7), HASHES["canon"], "canon")
    base = payload(chunks(EDITORIAL, 4), HASHES["base"], "editorial base")
    phase2 = payload((EDITORIAL / "phase2.txt").read_text().strip(), HASHES["phase2"], "phase 2")
    encoded = "".join((EDITORIAL / f"phase3-{i:02d}.txt").read_text().strip() for i in range(1, 3))
    phase3 = payload(encoded, HASHES["phase3"], "phase 3")
    return canon, base, phase2, phase3
