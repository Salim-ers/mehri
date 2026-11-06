#!/usr/bin/env bash
# Préparation reproductible des polices (sous-ensemble + instanciation).
# Prérequis : pip install fonttools brotli
set -euo pipefail
cd "$(dirname "$0")/.."
U="U+0020-007E,U+00A0-00FF,U+0152-0153,U+0178,U+02C6,U+02DC,U+2009,U+200A,U+202F,U+2010-2014,U+2018-201E,U+2022,U+2026,U+2032-2033,U+2039-203A,U+20AC,U+2190-2193,U+2212"
TMP="$(mktemp -d)"
fonttools varLib.instancer assets/fonts-source/newsreader-latin-opsz-normal.woff2 wght=340:440 opsz=40 -o "$TMP/n.ttf" -q
fonttools varLib.instancer assets/fonts-source/newsreader-latin-opsz-italic.woff2 wght=320:400 opsz=40 -o "$TMP/i.ttf" -q
pyftsubset "$TMP/n.ttf" --unicodes="$U" --layout-features='kern,liga,clig,calt,onum,lnum' --flavor=woff2 --output-file=src/fonts/newsreader-normal.woff2
pyftsubset "$TMP/i.ttf" --unicodes="$U" --layout-features='kern,liga,clig,calt,onum,lnum' --flavor=woff2 --output-file=src/fonts/newsreader-italic.woff2
pyftsubset assets/fonts-source/instrument-sans-latin-wght-normal.woff2 --unicodes="$U" --layout-features='kern,liga,clig,calt,ss01,tnum' --flavor=woff2 --output-file=src/fonts/instrument-sans-latin-wght-normal.woff2
rm -rf "$TMP"
echo "Polices régénérées dans src/fonts/"
