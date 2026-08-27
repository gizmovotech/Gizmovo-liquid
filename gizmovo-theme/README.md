# Gizmovo — Shopify OS 2.0 Theme

A curated multi-category tech/gadget accessories store theme. Bellroy-inspired: warm off-white base, charcoal text, a single clay-terracotta accent (`#C75B39`), photography-led layouts, and fully working interactions.

## Design system
- **Accent:** `#C75B39` (clay terracotta) — CTAs, badges, hover/active states only.
- **Base:** background `#F7F5F1`, text `#1A1A18`, neutral gray `#ECE9E3`.
- **Type:** Inter Tight (headings) + Inter (body), loaded from Google Fonts.
- All colors are editable in **Theme settings → Colors**.

## What's included
- **Homepage** (`templates/index.json`): Hero → Category grid → Best sellers rail → Editorial → New arrivals rail → Trust strip → Newsletter. Every section is customizer-editable via `{% schema %}`.
- **Working interactions** (in `assets/theme.js`):
  - Sticky header that gains a shadow only after scrolling.
  - Slide-out **mobile nav** overlay (hamburger).
  - Slide-down **search overlay** (search icon).
  - **AJAX cart drawer** using `/cart/add.js` + `/cart.js` + `/cart/change.js` — add to cart never reloads the page. Quantity change & remove work live.
  - Product rails with arrow controls, product gallery + variant switching.
- **Collection page:** native Shopify filters (`collection.filters`) + sorting + pagination.
- **Product page:** gallery + thumbnails, variant selector, quantity, accent Add to Cart, trust badges directly under the button.
- Templates for cart, search, list-collections, page, and 404.

## Install
### Option A — Upload as ZIP
1. Zip the **contents** of `gizmovo-theme/` (so `layout/`, `sections/`, etc. are at the zip root).
   ```bash
   cd gizmovo-theme && zip -r ../gizmovo-theme.zip . && cd ..
   ```
2. Shopify admin → **Online Store → Themes → Add theme → Upload zip file**.
3. Customize → set the Header menu, and pick collections for the Best sellers / New arrivals rails.

### Option B — Shopify CLI (live dev)
```bash
shopify theme dev --path gizmovo-theme
```

## Setup notes
- Create a **Best Sellers** and a **New Arrivals** collection, then assign them in the theme editor on each Product rail section.
- Create a **Main menu** (Navigation) — the header/mobile nav reads from it.
- Category tiles ship with placeholder photos; upload your own per tile in **Category grid** blocks. Point each tile's link at its collection.
- All product/price/cart data is pulled live from Shopify objects — nothing is hardcoded.

## Structure
```
gizmovo-theme/
├── assets/        base.css, theme.js
├── config/        settings_schema.json, settings_data.json
├── layout/        theme.liquid
├── locales/       en.default.json
├── sections/      header, footer, cart-drawer, hero, category-grid,
│                  product-rail, editorial, trust-strip, newsletter,
│                  main-product, main-collection, main-cart, main-search,
│                  main-list-collections, main-page, main-404
├── snippets/      icon.liquid, product-card.liquid
└── templates/     index / product / collection / cart / search /
                   list-collections / page / 404 (.json)
```
