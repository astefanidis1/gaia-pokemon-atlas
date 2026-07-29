#!/usr/bin/env python3
"""Materialize GAIA Release Candidate metadata and generated assets.

The operation is deterministic and idempotent. CI runs it before validation and
browser assurance; local reviewers should run it once before serving /public/.
"""
from __future__ import annotations

import argparse
import os
from pathlib import Path

from generate_release_assets import generate_all

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "public" / "index.html"
DEFAULT_PUBLIC_URL = "https://astefanidis1.github.io/gaia-pokemon-atlas/"
RC_VERSION = "2026-07-29.1"


def transform(source: str, public_url: str) -> str:
    if 'data-gaia-release-head' in source:
        return source

    public_url = public_url.rstrip("/") + "/"
    image_url = public_url + "assets/gaia-social-preview.png"

    source = source.replace(
        '<meta name="description" content="GAIA Atlas — a fan-made global Pokémon surveillance and natural-history platform." />',
        '<meta name="description" content="The world is inhabited. Explore GAIA Atlas: verified Pokémon populations, synchronized migration, living regional ecology, and anomalous records on real Earth." />',
    )
    source = source.replace(
        '<meta name="theme-color" content="#071019" />',
        '<meta name="theme-color" content="#071019" />\n'
        '  <meta name="application-name" content="GAIA Atlas" />\n'
        '  <meta name="apple-mobile-web-app-title" content="GAIA" />\n'
        '  <meta name="apple-mobile-web-app-capable" content="yes" />\n'
        '  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />\n'
        '  <meta name="robots" content="index,follow,max-image-preview:large" />\n'
        f'  <meta name="gaia-release" content="RC1-{RC_VERSION}" data-gaia-release-head />',
    )
    source = source.replace(
        '<meta property="og:title" content="GAIA Atlas" />',
        '<meta property="og:title" content="GAIA Atlas — The world is inhabited." />\n'
        '  <meta property="og:site_name" content="GAIA Atlas" />',
    )
    source = source.replace(
        '<meta property="og:description" content="The world is inhabited. Explore verified populations, live migration, ecological records, and anomalous contact points." />',
        '<meta property="og:description" content="Open a living global Pokémon intelligence network: exact populations, synchronized migration, regional ecosystems, dossiers, and anomalous records." />',
    )
    source = source.replace(
        '<meta property="og:type" content="website" />',
        '<meta property="og:type" content="website" />\n'
        f'  <meta property="og:url" content="{public_url}" />\n'
        f'  <meta property="og:image" content="{image_url}" />\n'
        f'  <meta property="og:image:secure_url" content="{image_url}" />\n'
        '  <meta property="og:image:type" content="image/png" />',
    )
    source = source.replace(
        '<meta name="twitter:card" content="summary_large_image" />',
        '<meta name="twitter:card" content="summary_large_image" />\n'
        '  <meta name="twitter:title" content="GAIA Atlas — The world is inhabited." />\n'
        '  <meta name="twitter:description" content="A living global Pokémon surveillance and natural-history network." />\n'
        f'  <meta name="twitter:image" content="{image_url}" />',
    )
    source = source.replace('<title>GAIA Atlas</title>', '<title>GAIA Atlas — The world is inhabited.</title>')
    source = source.replace(
        '<link rel="icon" href="assets/gaia-seal.svg" type="image/svg+xml" />',
        '<link rel="canonical" href="' + public_url + '" />\n'
        '  <link rel="icon" href="assets/gaia-seal.svg" type="image/svg+xml" />\n'
        '  <link rel="icon" href="assets/gaia-icon-192.png" sizes="192x192" type="image/png" />\n'
        '  <link rel="apple-touch-icon" href="assets/gaia-apple-touch-icon.png" sizes="180x180" />\n'
        '  <link rel="manifest" href="manifest.webmanifest" />',
    )
    source = source.replace(
        '<link rel="stylesheet" href="styles.css" />',
        '<link rel="stylesheet" href="styles.css" />\n'
        '  <link rel="stylesheet" href="release-candidate.css" data-gaia-rc data-gaia-release-head />',
    )
    source = source.replace(
        '<strong>Establishing GAIA census link</strong>',
        '<strong>Establishing GAIA world-state link</strong>',
    )
    source = source.replace(
        '<span id="loadingStatus">Reconciling 161 living-species records…</span>',
        '<span id="loadingStatus">Synchronizing census, migration, ecology, and civilian access…</span>',
    )
    source = source.replace(
        '<p>The Index and Records remain available while the live basemap reconnects.</p>',
        '<p>The cached Index, Records, regional ecology, and Field Log remain available while the live basemap reconnects.</p>',
    )
    return source


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="Fail unless the deployable HTML is already materialized")
    parser.add_argument("--public-url", default=os.environ.get("GAIA_PUBLIC_URL", DEFAULT_PUBLIC_URL))
    args = parser.parse_args()

    generate_all()
    original = INDEX.read_text(encoding="utf-8")
    prepared = transform(original, args.public_url)

    required = (
        'data-gaia-release-head',
        'manifest.webmanifest',
        'gaia-social-preview.png',
        'gaia-apple-touch-icon.png',
        'release-candidate.css',
        f'RC1-{RC_VERSION}',
    )
    missing = [marker for marker in required if marker not in prepared]
    if missing:
        raise SystemExit(f"ERROR: release candidate materialization missing markers: {missing}")

    if args.check:
        if prepared != original:
            raise SystemExit("ERROR: public/index.html has not been materialized for RC1")
        print(f"GAIA RC1 HTML and generated assets verified ({args.public_url})")
        return 0

    if prepared != original:
        INDEX.write_text(prepared, encoding="utf-8", newline="\n")
        print(f"GAIA RC1 HTML materialized ({args.public_url})")
    else:
        print("GAIA RC1 HTML already materialized")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
