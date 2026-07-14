# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nilamburwoods is a premium furniture discovery platform for Thiruvananthapuram, Kerala. Customers browse online and visit the physical **Experience Partner** showroom in Powdikonam to buy. No e-commerce / no payments — purely a showcase + lead generation site via WhatsApp.

## Architecture

Same pipeline as Coorg Investments:
- **Google Form → Google Sheet → CSV** (published) → **GitHub Actions** → `convert-csv.js` → `listings.json` → `generate.js` → `index.html`
- `index.template.html` is the master template with 3 placeholders: `<!-- PROPERTY_CARDS_PLACEHOLDER -->`, `<!-- FILTER_TABS_PLACEHOLDER -->`, `<!-- LAST_UPDATED_PLACEHOLDER -->`
- `index.html` is the generated output committed by CI — never edit it directly

## Key Files

| File | Purpose |
|------|---------|
| `index.template.html` | Master template — all CSS, HTML, JS |
| `generate.js` | Builds `index.html` from template + `listings.json` |
| `convert-csv.js` | Parses `properties.csv` → `listings.json` |
| `listings.json` | Current furniture listings (generated) |
| `.github/workflows/update-listings.yml` | CI pipeline |
| `apps-script.gs` | Google Apps Script webhook trigger |

## Listing Fields (listings.json / Google Sheet columns)

| Field | Description |
|-------|-------------|
| `status` | `Active` or `Sold` — only Active rows are shown |
| `title` | Item name (e.g. "Teak King Bed") |
| `category` | Used for filter tabs: `Bed`, `Sofa`, `Dining`, `Wardrobe`, etc. |
| `material` | e.g. "Nilambur Teak", "Rosewood" |
| `condition` | `New` or `Pre-loved` |
| `price` | Display price string e.g. "₹65,000" |
| `price_label` | Optional suffix e.g. "onwards", "negotiable" |
| `dimensions` | e.g. "72 × 60 inches" |
| `finish` | e.g. "Natural Walnut", "Mahogany" |
| `description` | Free text; line breaks preserved |
| `photos` | Comma-separated Google Drive share URLs |
| `youtube_url` | Optional YouTube video URL |
| `partner` | Experience partner name (shown on card) |

## Google Sheet Column Mapping

`convert-csv.js` maps these header names (case-insensitive) to JSON fields:
- `Item Title` / `Title` → `title`
- `Category` → `category`
- `Material` / `Wood Type` → `material`
- `Condition` → `condition`
- `Price` / `Selling Price` → `price`
- `Price Label` → `price_label`
- `Dimensions` / `Size` → `dimensions`
- `Finish` / `Color` → `finish`
- `Description` → `description`
- `Photos` / `Photo URLs` → `photos`
- `YouTube URL` / `YouTube` → `youtube_url`
- `Partner` / `Experience Partner` → `partner`
- `Status` → `status`

## Design System

Fonts: `Cormorant Garamond` (serif headings) + `DM Sans` (body)

CSS custom properties:
- `--obsidian: #111111` — primary dark
- `--ivory: #FAFAF7` — page background
- `--warm: #F4F0EA` — section background
- `--teak: #7C4A2D` — wood accent / prices
- `--gold: #B5841A` — highlights / CTAs
- `--muted: #888888` — secondary text
- `--border: #E5E0D8` — dividers
- `--wa: #25D366` — WhatsApp green

## Experience Partner

- **Name**: Home Vibes Furniture & Interiors
- **Location**: Powdikonam, Thiruvananthapuram
- **Address**: Pothencode – Powdikonam Road, Powdikonam – Vattakarikkakom Rd, Uliyazhathura, Kerala 695587
- **Phone**: +91 94477 93463
- **Hours**: Mon–Sat 10 AM–8 PM, Sun 10 AM–6:30 PM
- **Maps**: https://share.google/XdkMxh0AgZ0HCwKOA

## Contact / WhatsApp

All CTAs use `https://wa.me/918237084084`. Phone `+91 82370 84084` appears throughout.

## Local Development

```bash
node generate.js   # generates index.html from template + listings.json
# open index.html in browser to preview
```

## Responsive Breakpoints

- `≤ 1100px` — 2-column listings grid
- `≤ 900px` — mobile nav, single-column layouts
- `≤ 640px` — single-column cards (border+radius), stacked contact strip
