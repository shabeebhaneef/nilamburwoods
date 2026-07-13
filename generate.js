/**
 * generate.js — Nilamburwoods
 * Reads listings.json and rebuilds index.html from index.template.html.
 * Run: node generate.js
 */

const fs   = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'listings.json');
if (!fs.existsSync(dataPath)) {
  console.error('❌  listings.json not found. Run the GitHub Action first.');
  process.exit(1);
}

const listings = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  .filter(p => p.status && p.status.trim().toLowerCase() === 'active')
  .filter(p => p.title && p.title.trim() !== '');

console.log(`✅  Loaded ${listings.length} active listings`);

// ── WhatsApp SVG ────────────────────────────────────────────────
const WA_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

// ── Helpers ─────────────────────────────────────────────────────
function waLink(title) {
  const msg = encodeURIComponent(
    `Hi, I'm interested in the "${title}" listed on Nilamburwoods. Please share more details.`
  );
  return `https://wa.me/918237084084?text=${msg}`;
}

function youtubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function driveUrls(raw) {
  if (!raw) return [];
  return raw.split(',')
    .map(u => u.trim()).filter(Boolean)
    .map(u => {
      const m = u.match(/\/d\/([a-zA-Z0-9_-]+)/) || u.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1000` : u;
    })
    .slice(0, 6);
}

function esc(text) {
  return (text || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function descHtml(text) {
  return esc(text).replace(/\r?\n/g, '<br>');
}

function specChip(icon, text) {
  if (!text || text.trim() === '') return '';
  return `<span class="spec-chip">${icon} ${esc(text.trim())}</span>`;
}

// ── Build card ───────────────────────────────────────────────────
function buildCard(p) {
  let imgs = driveUrls(p.photos);
  if (imgs.length === 0) imgs = ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=80'];

  const ytId    = youtubeId(p.youtube_url);
  const type    = (p.category || 'furniture').toLowerCase().replace(/\s+/g, '-');
  const isSold  = (p.status || '').toLowerCase() === 'sold';

  const videoBtn = ytId
    ? `<a href="#" class="card-video-btn" onclick="openVideo(event,'${ytId}')" title="Watch walkthrough" aria-label="Watch video">▶</a>`
    : '';

  const specs = [
    specChip('🪵', p.material),
    specChip('📐', p.dimensions),
    specChip('🎨', p.finish),
  ].filter(Boolean).join('');

  const partnerLine = p.partner
    ? `<div class="card-partner">📍 Available at <strong>${esc(p.partner)}</strong></div>`
    : '';

  return `
      <!-- ${esc(p.title)} -->
      <div class="property-card fade-up" data-type="${esc(type)}">
        <div class="card-image">
          ${imgs.map((src, idx) =>
            `<img src="${src}" alt="${esc(p.title)}" loading="lazy" class="card-img${idx === 0 ? ' active' : ''}">`
          ).join('\n          ')}
          ${imgs.length > 1 ? `
          <button class="img-nav prev" onclick="cycleImg(event,this,-1)" aria-label="Previous photo">‹</button>
          <button class="img-nav next" onclick="cycleImg(event,this,1)" aria-label="Next photo">›</button>
          <span class="img-count">1/${imgs.length}</span>` : ''}
          <span class="card-badge${isSold ? ' sold' : ''}">${isSold ? 'Sold' : esc(p.category || 'Furniture')}</span>
          ${videoBtn}
        </div>
        <div class="card-body">
          <div class="card-meta">
            <span class="card-category">${esc(p.category || '')}</span>
            ${p.condition ? `<span class="card-condition">${esc(p.condition)}</span>` : ''}
          </div>
          <h3 class="card-title">${esc(p.title)}</h3>
          <div class="card-price">${esc(p.price)}${p.price_label ? ` <small>${esc(p.price_label)}</small>` : ''}</div>
          <div class="card-specs">${specs}</div>
          <p class="card-desc">${descHtml(p.description)}</p>
          ${partnerLine}
          <a href="${waLink(p.title)}" class="card-wa-btn" target="_blank" rel="noopener">
            ${WA_SVG}
            Enquire on WhatsApp
          </a>
        </div>
      </div>`;
}

// ── Build filter tabs ─────────────────────────────────────────────
function buildFilterTabs(listings) {
  const cats = [...new Set(listings.map(p => (p.category || 'Furniture').toLowerCase().replace(/\s+/g, '-')))];
  const tabs  = cats.map(c => {
    const label = c.charAt(0).toUpperCase() + c.slice(1).replace(/-/g, ' ');
    return `<button class="filter-tab" onclick="filterProps('${c}', this)" role="tab">${label}</button>`;
  }).join('\n        ');
  return `<button class="filter-tab active" onclick="filterProps('all', this)" role="tab">All</button>
        ${tabs}`;
}

// ── Inject into template ──────────────────────────────────────────
const templatePath = path.join(__dirname, 'index.template.html');
if (!fs.existsSync(templatePath)) {
  console.error('❌  index.template.html not found.');
  process.exit(1);
}

let html = fs.readFileSync(templatePath, 'utf8');

const cardsHtml = listings.length > 0
  ? listings.map(p => buildCard(p)).join('\n')
  : `<div class="listings-empty">
       <p>No furniture listed at the moment.</p>
       <p>Check back soon or <a href="https://wa.me/918237084084" style="color:var(--teak);font-weight:600;">contact us on WhatsApp</a>.</p>
     </div>`;

html = html.replace('<!-- PROPERTY_CARDS_PLACEHOLDER -->', cardsHtml);
html = html.replace('<!-- FILTER_TABS_PLACEHOLDER -->', buildFilterTabs(listings));

const now = new Date().toLocaleDateString('en-IN', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata'
});
html = html.replace(/<!-- LAST_UPDATED_PLACEHOLDER -->/g, now);

fs.writeFileSync(path.join(__dirname, 'index.html'), html, 'utf8');
console.log(`✅  index.html generated with ${listings.length} listings — ${now}`);
