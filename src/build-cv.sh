#!/bin/bash
# Regenerate the CV PDF from src/cv.html -> assets/Bohdan-Lukin-CV.pdf
# Run from the repo root.
set -e
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$ROOT/assets/Bohdan-Lukin-CV.pdf" "file://$ROOT/src/cv.html"
echo "Built $ROOT/assets/Bohdan-Lukin-CV.pdf"
