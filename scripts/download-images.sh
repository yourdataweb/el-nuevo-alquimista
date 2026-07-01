#!/usr/bin/env bash
# Download game images from Wikimedia Commons.
# Run from repo root: bash scripts/download-images.sh
# Skips files that already exist. Safe to re-run.

set -euo pipefail
cd "$(dirname "$0")/.."

# Download via Wikimedia Commons Special:FilePath redirect (always resolves to real URL)
# Location images are shown at most ~400px wide on mobile — 600px gives 1.5× for retina.
# City background is full-screen on tablet — 800px is sufficient.
download_commons() {
  local dest="$1"
  local filename="$2"   # exact filename on Commons (no "File:" prefix)
  local width="${3:-600}"
  if [ -f "$dest" ] && [ "$(stat -c%s "$dest")" -gt 10000 ]; then
    echo "  skip  $dest"
    return
  fi
  echo "  fetch $dest"
  local encoded
  encoded=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$filename")
  curl -L --retry 3 --silent --show-error --max-time 30 \
    -o "$dest" \
    "https://commons.wikimedia.org/wiki/Special:FilePath/${encoded}?width=${width}" \
    || { echo "  FAIL  $dest (non-fatal)"; rm -f "$dest"; }
}

mkdir -p public/locations public/cities

echo "=== City images ==="
download_commons public/cities/barcelona.jpg \
  "Port Vell, Barcelona, Spain - Jan 2007.jpg" 800

echo ""
echo "=== Location images ==="

# Existing locations (re-fetch if missing/corrupt)
download_commons public/locations/bcn-home.jpg \
  "Carrer de Verdi, Gràcia, Barcelona.jpg" || true
download_commons public/locations/bcn-plaza-catalunya.jpg \
  "Placa Catalunya, Barcelona (P1170670).jpg"
download_commons public/locations/bcn-plaza-real.jpg \
  "Plaza Reial - panoramio.jpg"
download_commons public/locations/bcn-plaza-espanya.jpg \
  "Pla_de_Palau_(Barcelona).jpg" || true
download_commons public/locations/bcn-library-central.jpg \
  "La Central del Raval.jpg" || true
download_commons public/locations/bcn-library-catalunya.jpg \
  "Biblioteca de Catalunya.jpg" || true
download_commons public/locations/bcn-park-ciutadella.jpg \
  "Llac Parc Ciutadella.jpg" || true
download_commons public/locations/bcn-park-guell.jpg \
  "Parc Güell dragon.jpg" || true
download_commons public/locations/bcn-park-montjuic.jpg \
  "Montjuïc Castle 2014.jpg" || true
download_commons public/locations/bcn-market-boqueria.jpg \
  "La Boqueria, Barcelona.jpg" || true
download_commons public/locations/bcn-market-sant-Antoni.jpg \
  "Mercat de Sant Antoni, Barcelona.jpg" || true
download_commons public/locations/bcn-church-santa-maria.jpg \
  "Santa Maria del Mar (Barcelona) - Interior.jpg" || true
download_commons public/locations/bcn-church-sagrada.jpg \
  "Barcelona - Exterior of the Apse of the Sagrada Família - Western exposure.jpg"
download_commons public/locations/bcn-monument-casa-batllo.jpg \
  "Barcelona - Casa Batlló.jpg" || true
download_commons public/locations/bcn-monument-pedrera.jpg \
  "La Pedrera-Rooftop.JPG" || true
download_commons public/locations/bcn-monument-arc-triomf.jpg \
  "Arc de Triomf (Barcelona).jpg" || true
download_commons public/locations/bcn-cafe-federal.jpg \
  "Passeig de Gràcia and Carrer de Provença crossroads seen from Casa Milà, Barcelona, 2023.jpg"
download_commons public/locations/bcn-cafe-satan.jpg \
  "Building in passeig del Born, 8.jpg"
download_commons public/locations/bcn-cafe-nomad.jpg \
  "Passeig de Gràcia and Carrer de Provença crossroads seen from Casa Milà, Barcelona, 2023.jpg"
download_commons public/locations/bcn-office-22.jpg \
  "Rambla del Poblenou - 20240531 114056.jpg"
download_commons public/locations/bcn-theatre-lliure.jpg \
  "Teatre Lliure (Barcelona).jpg" || true

# New locations
download_commons public/locations/bcn-plaza-sant-jaume.jpg \
  "Barcelona - Plaça Sant Jaume.jpg"
download_commons public/locations/bcn-plaza-gracia.jpg \
  "Placa de la Vila de Gracia.jpg" || true
download_commons public/locations/bcn-plaza-lesseps.jpg \
  "Plaça de Lesseps 1.jpg"
download_commons public/locations/bcn-library-born.jpg \
  "Building in passeig del Born, 8.jpg"
download_commons public/locations/bcn-park-laberint.jpg \
  "Parc del Laberint d'Horta Barcelona 4.jpg"
download_commons public/locations/bcn-park-diagonal-mar.jpg \
  "Parc de Diagonal Mar (8), July 2009.JPG"
download_commons public/locations/bcn-market-santa-caterina.jpg \
  "Mercat de Santa Caterina (Barcelona).jpg"
download_commons public/locations/bcn-market-galvany.jpg \
  "Mercat de Galvany des del carrer de Madrazo.jpg"
download_commons public/locations/bcn-church-pi.jpg \
  "Basílica de Santa Maria del Pi, Barcelona 16.05.2022 01.jpg"
download_commons public/locations/bcn-monument-palau-musica.jpg \
  "Palau de la Musica May 2026-4.jpg"
download_commons public/locations/bcn-monument-colom.jpg \
  "15-10-27-Vista des de l'estàtua de Colom a Barcelona-WMA 2798.jpg"
download_commons public/locations/bcn-monument-palau-nacional.jpg \
  "(Barcelona) Palau Nacional de Montjuïc - La cúpula central vista des de la terrassa oest.jpg"
download_commons public/locations/bcn-monument-tibidabo.jpg \
  "Amusement Park on Tibidabo with Barcelona views.jpg"
download_commons public/locations/bcn-monument-barceloneta.jpg \
  "Vista de la Barceloneta des del nucli antic de Llofriu.jpg"
download_commons public/locations/bcn-cafe-el-nacional.jpg \
  "Passeig de Gràcia and Carrer de Provença crossroads seen from Casa Milà, Barcelona, 2023.jpg"
download_commons public/locations/bcn-cafe-bar-marsella.jpg \
  "Building in passeig del Born, 8.jpg"
download_commons public/locations/bcn-office-poblenou.jpg \
  "Rambla del Poblenou - 20240531 114056.jpg"
download_commons public/locations/bcn-theatre-liceu.jpg \
  "L'Arbore di Diana. Gran Teatre del Liceu, Barcelona 2009.jpeg"
download_commons public/locations/bcn-theatre-nacional.jpg \
  "Edifici del Teatre Nacional de Catalunya - vista cònica.jpg"
download_commons public/locations/bcn-airport.jpg \
  "Terminal 2, Barcelona Airport, January 2015 (02).jpg"

echo ""
echo "Done. Missing images will use the gradient fallback in LocationImage."
