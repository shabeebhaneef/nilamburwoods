/**
 * convert-csv.js — Nilamburwoods
 * Parses properties.csv (from Google Sheet) and writes listings.json.
 * Run: node convert-csv.js
 */

const fs   = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'properties.csv');
if (!fs.existsSync(csvPath)) {
  console.error('❌  properties.csv not found.');
  process.exit(1);
}

// RFC-4180 compliant CSV parser
function parseCsv(text) {
  const rows = [];
  let col = '', row = [], inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i + 1];
    if (inQuote) {
      if (ch === '"' && next === '"') { col += '"'; i++; }
      else if (ch === '"') { inQuote = false; }
      else { col += ch; }
    } else {
      if (ch === '"') { inQuote = true; }
      else if (ch === ',') { row.push(col); col = ''; }
      else if (ch === '\n' || (ch === '\r' && next === '\n')) {
        if (ch === '\r') i++;
        row.push(col); col = '';
        rows.push(row); row = [];
      } else { col += ch; }
    }
  }
  if (col || row.length) { row.push(col); rows.push(row); }
  return rows;
}

const raw  = fs.readFileSync(csvPath, 'utf8');
const rows = parseCsv(raw);
if (rows.length < 2) {
  console.error('❌  CSV has no data rows.');
  process.exit(1);
}

// Map Google Sheet column headers → JSON field names
const FIELD_MAP = {
  'status':             'status',
  'item title':         'title',
  'title':              'title',
  'category':           'category',
  'material':           'material',
  'wood type':          'material',
  'condition':          'condition',
  'price':              'price',
  'selling price':      'price',
  'price label':        'price_label',
  'dimensions':         'dimensions',
  'size':               'dimensions',
  'finish':             'finish',
  'color':              'finish',
  'description':        'description',
  'youtube url':        'youtube_url',
  'youtube':            'youtube_url',
  'partner':            'partner',
  'experience partner': 'partner',
};

const headers = rows[0].map(h => h.trim().toLowerCase());
const listings = rows.slice(1)
  .filter(row => row.some(cell => cell.trim() !== ''))
  .map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      const key = FIELD_MAP[h];
      if (key && row[i] !== undefined) obj[key] = row[i].trim();
    });

    // Combine Photo 1 … Photo 5 columns into a single comma-separated photos field.
    // This matches the Google Form file upload pattern (one question per photo slot).
    const photos = ['photo 1', 'photo 2', 'photo 3', 'photo 4', 'photo 5']
      .map(k => { const i = headers.indexOf(k); return i >= 0 ? (row[i] || '').trim() : ''; })
      .filter(Boolean)
      .join(',');
    if (photos) obj.photos = photos;

    return obj;
  })
  .filter(obj => Object.keys(obj).length > 0);

const outPath = path.join(__dirname, 'listings.json');
fs.writeFileSync(outPath, JSON.stringify(listings, null, 2), 'utf8');
console.log(`✅  Converted ${listings.length} rows → listings.json`);
