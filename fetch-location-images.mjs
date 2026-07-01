// Fetch location images from Wikimedia Commons
// Uses known Commons filenames for reliability + curl for download (bypassing Node.js 403)

const LOCATIONS = [
  // Known Commons filenames for each location
  { id: 'bcn-home', file: 'Evening_light_over_Barcelona.jpg' },
  { id: 'bcn-plaza-catalunya', file: 'Placa Catalunya, Barcelona (P1170670).jpg' },
  { id: 'bcn-plaza-real', file: 'Barcelona - Nacht - Placa Reial 004.jpg' },
  { id: 'bcn-plaza-espanya', file: 'Plaça Espanya, Barcelona - panoramio (36).jpg' },
  { id: 'bcn-library-central', file: 'Hospital de la Santa Creu, escala Caritat.jpg' },
  { id: 'bcn-library-catalunya', file: 'Biblioteca de Catalunya - Barcelona (Catalonia).jpg' },
  { id: 'bcn-park-guell', file: 'Parc Güell Terrace.jpg' },
  { id: 'bcn-park-montjuic', file: 'Barcelona_-_Montjuïc_-_Castell_de_Montjuïc_1799_-_Carretera_de_Montjuïc_-_View_SE_towards_Passenger_ship_terminals_in_Barcelona.jpg' },
  { id: 'bcn-market-boqueria', file: 'Mercado de la Boqueria, Barcelona, España, 2016-01-13, DD 24-27 HDR.jpg' },
  { id: 'bcn-market-sant-antoni', file: 'Mercat_de_Sant_Antoni,_Barcelona.jpg' },
  { id: 'bcn-church-santa-maria', file: 'Santa_Maria_del_Mar,_Barcelona_05.jpg' },
  { id: 'bcn-church-sagrada', file: 'Sagrada Família - View East.jpg' },
  { id: 'bcn-monument-casa-batllo', file: 'Casa Batlló 003 - Barcelona - 2019-08-29.jpg' },
  { id: 'bcn-monument-pedrera', file: 'Casa Milà - Barcelona, Spain - Jan 2007.jpg' },
  { id: 'bcn-monument-arc-triomf', file: 'Arc de Triomf, Barcelona 2716.jpg' },
  { id: 'bcn-cafe-federal', file: 'Federal Café Barcelona.jpg' },
  { id: 'bcn-cafe-satan', file: 'Satan s Coffee Corner Barcelona.jpg' },
  { id: 'bcn-cafe-nomad', file: 'Nomad Coffee Barcelona.jpg' },
  { id: 'bcn-office-22', file: 'Torres Glòries and 22@ district, Barcelona.jpg' },
  { id: 'bcn-theatre-lliure', file: 'Teatre Lliure de Montjuic.jpg' },
];

const OUTPUT_DIR = 'public/locations';
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36';

import fs from 'fs';
import { get } from 'https';
import { execFileSync } from 'child_process';
import crypto from 'crypto';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function getCommonsUrl(filename) {
  // Build direct upload URL from filename hash
  // See: https://commons.wikimedia.org/wiki/Commons:FAQ#What_are_the_strangely_named_components_in_file_paths_for_media_files?
  const hash = crypto.createHash('md5').update(filename.replace(/ /g, '_')).digest('hex');
  const prefix1 = hash[0];
  const prefix2 = hash.substring(0, 2);
  const encoded = encodeURIComponent(filename.replace(/ /g, '_'));
  return `https://upload.wikimedia.org/wikipedia/commons/${prefix1}/${prefix2}/${encoded}`;
}

function downloadCurl(url, dest) {
  return new Promise((resolve, reject) => {
    try {
      execFileSync('curl', [
        '-s', '-L', '-o', dest,
        '-A', UA,
        '--connect-timeout', '10',
        '--max-time', '30',
        url,
      ], { timeout: 35000 });
      resolve();
    } catch (e) {
      reject(new Error(`curl failed: ${e.message}`));
    }
  });
}

async function main() {
  let success = 0;
  let fail = 0;

  for (const loc of LOCATIONS) {
    const dest = `${OUTPUT_DIR}/${loc.id}.jpg`;
    if (fs.existsSync(dest) && fs.statSync(dest).size > 200) {
      console.log(`✓ ${loc.id} — already cached (${Math.round(fs.statSync(dest).size / 1024)}KB)`);
      success++;
      continue;
    }

    const url = getCommonsUrl(loc.file);

    try {
      await downloadCurl(url, dest);
      const stats = fs.statSync(dest);
      if (stats.size > 200) {
        console.log(`✓ ${loc.id} — ${Math.round(stats.size / 1024)}KB (${loc.file})`);
        success++;
      } else {
        fs.unlinkSync(dest);
        console.log(`✗ ${loc.id} — ${loc.file} too small (${stats.size}b)`);
        fail++;
      }
    } catch (e) {
      console.log(`✗ ${loc.id} — download error: ${e.message}`);
      fail++;
    }
  }

  console.log(`\nDone: ${success} success, ${fail} failed`);
}

main().catch(console.error);
