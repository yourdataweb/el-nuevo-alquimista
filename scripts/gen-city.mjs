#!/usr/bin/env node
// Generate a city data file from OpenStreetMap via the Overpass API.
// Usage: node scripts/gen-city.mjs <city-id> <display-name> <country> <lat> <lng> [--prefix <id-prefix>]
// Example: node scripts/gen-city.mjs new-york "New York" "USA" 40.7128 -74.0060 --prefix nyc

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Args ───────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flagIdx = args.indexOf('--prefix');
let prefix = null;
if (flagIdx !== -1) {
  prefix = args[flagIdx + 1];
  args.splice(flagIdx, 2);
}

const [cityId, cityName, country, latStr, lngStr] = args;
if (!cityId || !cityName || !country || !latStr || !lngStr) {
  console.error('Usage: node scripts/gen-city.mjs <city-id> <display-name> <country> <lat> <lng> [--prefix <id-prefix>]');
  process.exit(1);
}

const lat = parseFloat(latStr);
const lng = parseFloat(lngStr);
if (isNaN(lat) || isNaN(lng)) {
  console.error('lat and lng must be numbers');
  process.exit(1);
}

// Default prefix: first letters of hyphenated city-id words, up to 3 chars
if (!prefix) {
  prefix = cityId.split('-').map((w) => w[0]).join('').substring(0, 3);
}

// ── Overpass query config ──────────────────────────────────────────────────────
const MAX_PER_TYPE = 4;
const OVERPASS_MAX_RESULTS = 300;

// Bounding box is much faster than around: — uses tile indexes instead of per-element distance calc.
// ~3 km city radius; ~55 km airport radius.
const D_LAT = 0.027, D_LNG = 0.036;
const BBOX = `${lat - D_LAT},${lng - D_LNG},${lat + D_LAT},${lng + D_LNG}`;
const BBOX_AIRPORT = `${lat - 0.5},${lng - 0.7},${lat + 0.5},${lng + 0.7}`;

// Three small batches — each stays well under the per-request timeout on dense cities.
// A: plazas, libraries, markets, airports
const QUERIES_A = [
  `node["place"="square"]["name"](${BBOX})`,
  `way["place"="square"]["name"](${BBOX})`,
  `node["leisure"="plaza"]["name"](${BBOX})`,
  `way["leisure"="plaza"]["name"](${BBOX})`,
  // library — ways/relations only (nodes rarely represent whole buildings)
  `way["amenity"="library"]["name"](${BBOX})`,
  `relation["amenity"="library"]["name"](${BBOX})`,
  // market
  `node["amenity"="marketplace"]["name"](${BBOX})`,
  `way["amenity"="marketplace"]["name"](${BBOX})`,
  `way["building"="market"]["name"](${BBOX})`,
  // airport — large bbox but aerodrome tag is rare
  `node["aeroway"="aerodrome"]["name"](${BBOX_AIRPORT})`,
  `way["aeroway"="aerodrome"]["name"](${BBOX_AIRPORT})`,
  `relation["aeroway"="aerodrome"]["name"](${BBOX_AIRPORT})`,
];

// B: parks + church/monument
const QUERIES_B = [
  // park — ways/relations only; node["leisure"="park"] matches every node within a park
  `way["leisure"="park"]["name"](${BBOX})`,
  `relation["leisure"="park"]["name"](${BBOX})`,
  // church — wikidata filter to get notable ones only
  `node["amenity"="place_of_worship"]["name"]["wikidata"](${BBOX})`,
  `way["amenity"="place_of_worship"]["name"]["wikidata"](${BBOX})`,
  `relation["amenity"="place_of_worship"]["name"]["wikidata"](${BBOX})`,
  // monument / attraction — wikidata keeps results notable
  `node["historic"="monument"]["name"](${BBOX})`,
  `way["historic"="monument"]["name"](${BBOX})`,
  `node["tourism"="attraction"]["name"]["wikidata"](${BBOX})`,
  `way["tourism"="attraction"]["name"]["wikidata"](${BBOX})`,
  `relation["tourism"="attraction"]["name"]["wikidata"](${BBOX})`,
];

// C: cafe/theatre/office
const QUERIES_C = [
  // cafe — wikidata filter to avoid matching every coffee shop
  `node["amenity"="cafe"]["name"]["wikidata"](${BBOX})`,
  `way["amenity"="cafe"]["name"]["wikidata"](${BBOX})`,
  // theatre
  `node["amenity"="theatre"]["name"](${BBOX})`,
  `way["amenity"="theatre"]["name"](${BBOX})`,
  `relation["amenity"="theatre"]["name"](${BBOX})`,
  `node["amenity"="cinema"]["name"](${BBOX})`,
  `way["amenity"="cinema"]["name"](${BBOX})`,
  // office — only explicitly tagged buildings
  `way["building"="office"]["name"](${BBOX})`,
];

// Map OSM tags → LocationType (checked in order; first match wins)
function classifyTags(tags) {
  const a = tags.amenity;
  const l = tags.leisure;
  const p = tags.place;
  const h = tags.historic;
  const t = tags.tourism;
  const b = tags.building;
  const o = tags.office;
  const aw = tags.aeroway;
  if (aw === 'aerodrome') return 'airport';
  if (p === 'square' || l === 'plaza') return 'plaza';
  if (a === 'library') return 'library';
  if (l === 'park' || l === 'garden') return 'park';
  if (a === 'marketplace' || b === 'market') return 'market';
  if (a === 'place_of_worship') return 'church';
  if (h === 'monument' || t === 'attraction') return 'monument';
  if (a === 'cafe') return 'cafe';
  if (a === 'theatre' || a === 'cinema') return 'theatre';
  if (o || b === 'office') return 'office';
  return null;
}

const TYPE_DESC = {
  plaza:    (name) => `${name}. A lively public square where the city gathers.`,
  library:  (name) => `${name}. A quiet refuge of books and ideas.`,
  park:     (name) => `${name}. A green lung in the heart of the city.`,
  market:   (name) => `${name}. A bustling market full of colour, sound, and commerce.`,
  church:   (name) => `${name}. A place of history, silence, and ceremony.`,
  monument: (name) => `${name}. A landmark that anchors the city's memory.`,
  cafe:     (name) => `${name}. Espresso, conversation, and the passing day.`,
  theatre:  (name) => `${name}. Where stories are told under lights every night.`,
  office:   (name) => `${name}. A hive of industry in the city's working district.`,
  airport:  (name) => `${name}. The city's gateway to the world — and to the journey.`,
  home:     ()     => 'Your apartment in the city. A comfortable place you call home.',
};

// maps.mail.ru is the most reliable; overpass-api.de is kept as fallback
const OVERPASS_ENDPOINTS = [
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Helpers ───────────────────────────────────────────────────────────────────
async function overpassQuery(queryLines, label) {
  const query = `[out:json][timeout:45];\n(\n${queryLines.join(';\n')};\n);\nout center ${OVERPASS_MAX_RESULTS};`;
  const delays = [0, 5000, 10000];

  for (let attempt = 0; attempt < delays.length; attempt++) {
    const endpoint = OVERPASS_ENDPOINTS[attempt % OVERPASS_ENDPOINTS.length];
    if (delays[attempt] > 0) {
      process.stdout.write(`  retry ${label} via ${endpoint.replace('https://', '')} (${delays[attempt] / 1000}s wait)... `);
      await sleep(delays[attempt]);
    }
    const url = `${endpoint}?data=${encodeURIComponent(query)}`;
    try {
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'BadassQuest2/1.0' },
        signal: AbortSignal.timeout(50000),
      });
      if (res.status === 429 || res.status === 503 || res.status === 504) {
        const msg = (await res.text()).substring(0, 120);
        if (attempt < delays.length - 1) { console.log(`${res.status} — will retry`); continue; }
        throw new Error(`Overpass ${res.status}: ${msg}`);
      }
      if (!res.ok) throw new Error(`Overpass ${res.status}: ${(await res.text()).substring(0, 200)}`);
      const data = await res.json();
      if (data.remark?.includes('timed out')) {
        if (attempt < delays.length - 1) { console.log(`query timed out — will retry`); continue; }
        throw new Error(`Overpass query timed out: ${data.remark}`);
      }
      return data;
    } catch (e) {
      if (attempt < delays.length - 1) { console.log(`error — will retry: ${e.message}`); continue; }
      throw e;
    }
  }
}

function getCenter(el) {
  if (el.type === 'node') return { lat: el.lat, lng: el.lon };
  if (el.center) return { lat: el.center.lat, lng: el.center.lon };
  return null;
}

function buildAddress(tags, name) {
  const parts = [];
  if (tags['addr:housenumber'] && tags['addr:street']) {
    parts.push(`${tags['addr:housenumber']} ${tags['addr:street']}`);
  } else if (tags['addr:street']) {
    parts.push(tags['addr:street']);
  }
  if (!parts.length) parts.push(name);
  if (tags['addr:city'] || cityName) parts.push(tags['addr:city'] || cityName);
  return parts.join(', ');
}

function qualityScore(tags) {
  return (
    (tags.wikipedia ? 3 : 0) +
    (tags.wikidata ? 2 : 0) +
    (tags['addr:street'] ? 1 : 0) +
    (tags.description ? 1 : 0) +
    (tags.website ? 1 : 0)
  );
}

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 28);
}

function makeId(type, name, used) {
  const base = `${prefix}-${type}-${slugify(name)}`;
  let id = base;
  let n = 2;
  while (used.has(id)) { id = `${base}-${n++}`; }
  used.add(id);
  return id;
}

function ts(val) {
  // JSON.stringify gives properly escaped double-quoted string
  return JSON.stringify(String(val));
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const locations = [];
  const manifest = [];
  const usedIds = new Set();

  // Home location — synthetic, near city centre
  const homeId = `${prefix}-home`;
  usedIds.add(homeId);
  locations.push({
    id: homeId,
    name: 'Your apartment',
    type: 'home',
    position: { lat, lng },
    address: cityName,
    description: TYPE_DESC.home(),
    sprite: 'home',
  });
  manifest.push({ id: homeId, name: 'Your apartment', type: 'home' });

  // Three Overpass requests (A + B + C) to stay under per-request timeout
  let allElements = [];
  for (const [label, queries] of [['A (plaza/library/market)', QUERIES_A], ['B (park/church/monument)', QUERIES_B], ['C (cafe/theatre/office/airport)', QUERIES_C]]) {
    process.stdout.write(`Querying OSM batch ${label}... `);
    try {
      const data = await overpassQuery(queries, label);
      const els = data.elements || [];
      console.log(`${els.length} results`);
      allElements = allElements.concat(els);
    } catch (e) {
      console.log(`FAILED: ${e.message}`);
      process.exit(1);
    }
    await sleep(2000);
  }
  console.log(`Total raw results: ${allElements.length}`);

  // Group elements by LocationType, dedup by name within each type
  const byType = new Map();
  for (const el of allElements) {
    const tags = el.tags || {};
    const name = tags.name?.trim();
    if (!name || name.length < 2) continue;
    const pos = getCenter(el);
    if (!pos) continue;
    const type = classifyTags(tags);
    if (!type) continue;

    if (!byType.has(type)) byType.set(type, new Map());
    const byName = byType.get(type);
    const score = qualityScore(tags);
    const prev = byName.get(name);
    if (!prev || score > prev.score) byName.set(name, { el, pos, score });
  }

  for (const [type, byName] of byType) {
    const picks = [...byName.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_PER_TYPE);

    console.log(`  ${type}: ${picks.length} locations`);
    for (const { el, pos } of picks) {
      const tags = el.tags || {};
      const name = tags.name.trim();
      const id = makeId(type, name, usedIds);
      const address = buildAddress(tags, name);
      const description = tags.description || TYPE_DESC[type]?.(name) || `${name}.`;

      locations.push({ id, name, type, position: pos, address, description });
      manifest.push({ id, name, type });
      console.log(`    + ${id}`);
    }
  }

  // ── Write cache JSON (for image fetcher) ──────────────────────────────────
  const cacheDir = path.join(__dirname, '.city-cache');
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(
    path.join(cacheDir, `${cityId}.json`),
    JSON.stringify(manifest, null, 2)
  );

  // ── Write TypeScript ───────────────────────────────────────────────────────
  const locTs = locations.map((loc) => {
    const lines = [
      `    id: ${ts(loc.id)},`,
      `    name: ${ts(loc.name)},`,
      `    type: '${loc.type}',`,
      `    position: { lat: ${loc.position.lat.toFixed(6)}, lng: ${loc.position.lng.toFixed(6)} },`,
      `    address: ${ts(loc.address)},`,
      `    description: ${ts(loc.description)},`,
      `    descriptionEs: ${ts(loc.description)},`,
      `    descriptionCa: ${ts(loc.description)},`,
    ];
    if (loc.sprite) lines.push(`    sprite: '${loc.sprite}',`);
    return `  {\n${lines.join('\n')}\n  }`;
  }).join(',\n');

  // camelCase export name: new-york → newYork
  const exportName = cityId.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

  const out = `import type { City, LocationPOI } from '../../store/types';

const locations: LocationPOI[] = [
${locTs},
];

export const ${exportName}: City = {
  id: ${ts(cityId)},
  name: ${ts(cityName)},
  nameEs: ${ts(cityName)},
  nameCa: ${ts(cityName)},
  country: ${ts(country)},
  position: { lat: ${lat}, lng: ${lng} },
  locations,
};
`;

  const outPath = path.join(ROOT, 'src', 'data', 'cities', `${cityId}.ts`);
  fs.writeFileSync(outPath, out);

  console.log(`\nWrote ${outPath}`);
  console.log(`Wrote scripts/.city-cache/${cityId}.json`);
  console.log(`${locations.length} locations total (including home)\n`);
  console.log('Next steps:');
  console.log(`  1. Add to src/data/cities/index.ts:  import { ${exportName} } from './${cityId}';`);
  console.log(`     then add to registry:              ['${cityId}', ${exportName}]`);
  console.log(`  2. Fetch images: node fetch-location-images.mjs ${cityId}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
