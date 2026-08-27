# GIZMOVO — Product Requirements Document

## Original Problem Statement
Build a completely new, premium DTC e-commerce storefront for the brand **GIZMOVO** (gizmovo.shop) from scratch — curated, genuinely-useful gadgets. Primary market India (INR, free shipping), future international. Must feel like a legitimate independent premium brand (Apple/MUJI/Nothing-grade polish), never like a dropshipping store. Dark Navy + Warm Beige identity, mobile-first, high-end motion, ethical conversion (no fake reviews/urgency/scarcity), full accessibility & SEO readiness.

## User Choices
- Stack: React + FastAPI + MongoDB full working storefront.
- Products: seeded placeholder gadgets (configurable later).
- Payment: NOT wired now — checkout creates `pending_payment` orders; owner will connect Shopify + Razorpay.
- Currency: ₹ INR, free-shipping-across-India messaging.
- Full scope build.

## Architecture
- **Backend** (`/app/backend/server.py`, `seed_data.py`): FastAPI + Motor/MongoDB. Routes under `/api`: products (filter/sort/search), product detail + related, categories, predictive search (regex-escaped), cart lifecycle (max 5/line), newsletter, contact (validated), checkout (creates order, clears cart), order lookup. Seeds 13 products / 5 categories on startup (idempotent upsert).
- **Frontend** (`/app/frontend/src`): React Router, CartContext (localStorage cart_id + Mongo), Tailwind design system (Outfit/Inter, navy/beige), Framer Motion, lucide-react, sonner toasts. Brand config centralized in `lib/config.js` for easy rebrand.

## User Personas
- Gen Z / young adult (16–30), mobile-first, arrives from Instagram Reels, skeptical of new stores, price-conscious, design-driven.
- Secondary: older buyers who like useful, interesting products.

## Core Requirements (static)
Conversion > Trust > Product desirability > Mobile UX > Performance > Brand quality > Wow factor. No dishonest marketing.

## Implemented (2026-06)
- Homepage story flow: hero, trust strip, best sellers, category bento, navy storytelling, new drops, why-gizmovo, Instagram/UGC (placeholder), FAQ, newsletter CTA.
- Shop/collection with category chips, best-seller filter, sort; product cards with hover second-image, quick-add, badges, save %.
- Product page: gallery, variants, quantity (max 5), add-to-bag, buy-now, trust row, story/benefits/how-it-works/specs/what's-in-box, honest reviews architecture ("be the first"), related products.
- Premium sliding cart drawer (Escape/overlay/close, qty controls, subtotal), full cart page, checkout (shipping form + payment placeholder for Razorpay/Shopify), order confirmation (with deep-link fetch fallback).
- Full-screen search overlay (predictive, suggestions, empty + error states), About, FAQ, Contact (email only), 404, empty states.
- Mobile-first responsive, reduced-motion support, data-testids throughout, INR formatting, localization-ready money helper.
- Tested end-to-end (backend 43/47 pytest; all core UI flows). All reported issues fixed & verified.

## MUST configure manually in Shopify / before launch
- Real products, prices, compare-at, images, collections.
- Payment provider (Razorpay via Shopify), shipping timelines, return/refund/privacy/terms policies (currently placeholders).
- Real Instagram URL/handle & UGC posts (`lib/config.js` BRAND.instagram).
- Meta Pixel / analytics IDs (no tracking IDs hard-coded).

## Backlog (prioritized)
- P1: Wishlist/save; bundles & "frequently bought together" for AOV; real reviews integration.
- P1: Migrate FastAPI startup event to lifespan; seed pruning of stale slugs.
- P2: Multi-currency / international shipping; account/login; order history; predictive search via Mongo text index.
- P2: Cart add-item atomicity via array upsert operators.

## Next Tasks
- Wire live payments and real product data when the owner is ready.
