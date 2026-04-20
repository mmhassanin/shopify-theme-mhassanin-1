# Project Instructions

## Architectural & Behavioral Rules
- Follow strictly modern Shopify Online Store 2.0 architecture and standards.
- Ensure all sections have dynamic schemas and proper JSON structures.
- Prioritize high performance (lazy loading, optimized assets) and accessibility.
- Keep Liquid logic clean, semantic and lightweight.

## Coding Standards & UX Preferences
- Use Vanilla JS where possible; avoid heavy libraries like jQuery unless strictly necessary.
- Adopt modern CSS solutions, avoiding redundant styling.
- Design responsive, edge-to-edge full width rendering where applicable.
- Make all interactive elements, animations and micro-animations feel "premium" and smooth.
- Use explicit visual proportions, precise typography and spacing.
- Abstract component paddings/margins into Section schema ranges rather than hardcoded global CSS logic, mapped to target selectors directly in the section's `{% style %}`.

## Interactive Section Patterns
- For hover-tab components (sidebar + showcase), use absolute-positioned panels with `opacity` cross-fade — never show/hide with `display: none`.
- Store the ES6 controller class instance on the DOM element (e.g., `el.controllerInstance = this`) so Shopify Theme Editor events can access it.
- Always bind both `mouseenter` (desktop hover) and `click` (mobile tap) to interactive list items.
- Use `data-panel-index` on sidebar items and `data-panel-id` on showcase panels for clean JS lookups.

## Floating / Overlap UI Rules
- Use negative `margin-top` + `z-index` for floating sections. Never use `position: absolute` on section wrappers.
- Always make the overlap distance configurable via a range slider in the schema.
- Halve the overlap on mobile via `divided_by: 2` in the Liquid style block.

## Mobile Horizontal Scroll Pattern
- Convert vertical lists to horizontal scrollable rows on mobile using `overflow-x: auto` + `scroll-snap-type: x mandatory`.
- Always hide scrollbars: `-webkit-scrollbar { display: none }` and `scrollbar-width: none`.
- Use `scrollIntoView({ behavior: 'smooth', inline: 'center' })` when programmatically activating items.

## Native Vanilla JS Slider Pattern
- Use a `BrandsSlider` class scoped per section via IIFE and section ID.
- Store the instance on the DOM element (e.g., `el._brandsSlider = new BrandsSlider(el)`) so Shopify Theme Editor `shopify:section:load/unload` events can re-init or destroy it.
- Read all config from `data-*` attributes on the bar element — never inline Liquid variables directly into JS logic.
- Compute slide width via CSS `flex-basis` using `calc()` with dynamic Liquid gap/per-view values; translate the track with `translateX`.
- Always provide a Grid Mode fallback (horizontal scroll) when slider is toggled OFF via a Liquid `if/else` branch.

## Card Interaction Pattern
- Avoid wrapping entire cards in `<a>` tags if they contain internal links (`<ul><li><a>`), as this creates invalid HTML.
- Instead, use the "Stretching Link" pattern: Give the main title `<a>` a pseudo-element (`::after`) with `position: absolute; inset: 0; z-index: 1;`.
- Ensure the card container has `position: relative; overflow: hidden;` and set internal links/buttons to `position: relative; z-index: 2;` so they sit above the stretched link and remain clickable.
- **Electro Split Card Design**: Category cards use `position: relative` with text at left 60% and image at `position: absolute; bottom: 0; right: 0; width: 45%; height: 60%`. Circle-arrow (38px) sits at `right: 10px; top: 10px` and scales in on hover. Sub-links are blue `#0056b3` (not grey), title color is `#333e48`. Container `border-radius: 20px`, Grid gap uses `1px` separator lines via `background: #ebebeb` on the grid.

## Promo Banner + Carousel Pattern
- Use CSS Grid (`grid-template-columns: <banner_width>% 1fr`) with `gap: 0` and a shared `border-radius` + `overflow: hidden` on the grid container.
- Banner width configurable via schema range slider (default 30%). Products separated by `border-right: 1px solid #ebebeb`.
- Navigation arrows overlay the carousel at `position: absolute; top: 50%; transform: translateY(-50%)` with `pointer-events: none` on the container and `pointer-events: auto` on each button.
- Product carousel uses native CSS `scroll-snap` with vanilla JS arrow controllers — never `tiny-slider` or other heavy dependencies.
- Typography follows Electro reference: subheading `font-weight: 300`, heading `3rem/800`, discount value `5rem/900`, button `#fed700` with `#333` text.
- Always reuse the theme's existing `product-item.liquid` snippet for rendering product cards.

## Global UI Overrides
- **Wishlist App Removal**: The "SWishlist" or any third-party floating wishlist functionality has been permanently and thoroughly removed from the theme architecture via a "Search and Destroy" audit. The codebase enforces strict omission of wishlist components, tags, CSS globals, and DOM observer scripts to save performance overhead.

## OS Constraints
- Use Windows `cmd /c` for terminal execution.

## Git & GitHub Workflow
- Use a clean `.gitignore` to exclude temporary directories like `/scratch`, `.shopify`, and OS-specific files.
- Ensure the initial commit is clean and categorized.
- All future AI-assisted edits should be committed with descriptive messages.

## OS 2.0 Layout Architecture (`layout/theme.liquid`)
- **NEVER use `{% capture mainContent %}{{ content_for_layout }}`**. Always output `{{ content_for_layout }}` directly at the correct DOM location. Capturing it blocks HTTP caching and breaks the Theme Editor.
- **Always use `{% render %}` instead of `{% include %}`** for all snippet calls. `{% include %}` is deprecated.
- The `<main>` layout is driven by three branches determined by `template` and `settings.left_column_style`:
  1. `index` + left column active → container > row > left-col (3) + main-col (9)
  2. `index` + no left column → bare `content_for_layout`
  3. `page.*` templates → bare `content_for_layout` (no container wrap)
  4. All other templates → `<div class="{{ layout_class }}">` container wrapping `content_for_layout`
- The full-slideshow section is always rendered **outside** the container grid, directly before it.

## Vanilla JS Standards
- Never use `window.addEvent()` or `document.addEvent()` — these are custom polyfills defined in `js-resources.liquid`. Use the standard `window.addEventListener()` and `document.addEventListener()` in all layout and section code.
- Wrap all inline `<script>` blocks in an **IIFE** `(function() { ... })();` to prevent variable scope leakage into the global namespace.
- Prefer `var` in IIFE-wrapped inline scripts for maximum compatibility; use `const`/`let` only in ES module-style asset JS files.

## DOM Integrity Rules
- The RTL `dir="rtl"` attribute is applied conditionally on the `<html>` tag with a properly closed attribute: `{% if settings.direction == 'RTL' %} dir="rtl"{% endif %}`.
- The `.body-main-content` `<div>` wraps the header, main, and footer. The utility-bar `<div>` (back-to-top, popups) sits **outside** `.body-main-content` but inside `<body>`.
- All conditional `{% if %}` blocks that open a `<div>` must close that same `<div>` within the same logical block — never rely on a separate `{% if %}` further down to close it.

## OS 2.0 Dynamic App Block (`"@app"`) Standards
- **All main template sections** must include `{ "type": "@app" }` as the **first entry** in their `"blocks"` array to allow third-party Shopify apps (review apps, loyalty widgets, etc.) to inject into the Theme Editor without modifying theme code.
- The following sections have been audited and upgraded to include `"@app"`:
  - `product-template.liquid` ✅
  - `collection-template.liquid` ✅
  - `search-template.liquid` ✅
  - `related-products.liquid` ✅
  - `product-tabs-v2.liquid` ✅
  - `announcement-bar.liquid` ✅
  - `featured-collection.liquid` ✅
  - `featured-collection-with-image.liquid` ✅
  - `featured-collection-with-left-sidebar.liquid` ✅
  - `product-tabs-v1.liquid` ✅
  - `section-policy.liquid` ✅
  - `section-image-gallery.liquid` ✅
  - `section-image-gallery-v2.liquid` ✅
  - `section-featured-blog.liquid` ✅
  - `section-single-banner-with-product.liquid` ✅
  - `section-single-product.liquid` ✅
  - `section-support.liquid` ✅
  - `section-newsletter.liquid` ✅
- When creating new sections that use `"blocks"`, always add `"@app"` as the first block type unless the section is specifically restricted to header/footer groups.

## Deprecated API Patterns (Never Use)
- `{% include %}` → always use `{% render %}`. When converting, pass all required variables explicitly as named parameters (e.g., `{% render 'snippet', section: section, product: product %}`).
- `window.addEvent()` / `document.addEvent()` → these are legacy polyfills defined in `js-resources.liquid`. Always use `window.addEventListener()` / `document.addEventListener()` in section and layout code.
- **Theme-Wide Enforcement (Phase A Complete)**: As of this refactor, zero `{% include %}` tags and zero `.addEvent()` polyfill calls remain anywhere in the theme codebase (sections, snippets, layout, templates). This standard must be maintained for all future edits.

## Inline Style Migration
- **Never hardcode CSS** in HTML `style=""` attributes for values controlled by section schema settings (e.g., font-size, font-weight, colors). Instead, move those rules into the section's `{% style %}` block using the section ID as a scope selector.
- Example: `{{sectionID}} .element { font-size: {{ section.settings.fs }}px; }` inside `{%- style -%}`.

## Modern UI Schema Standards
- **Meticulous Schema Organization**: Schemas must group settings logically strictly using `"type": "header"` blocks (e.g., "General Settings", "Design & Colors", "Slider Settings", "Grid Settings").
- **Clear English Labels**: UI `label`s must be clear, human-readable English (e.g., "Layout Mode", "Items Per Row (Responsive)") rather than utilizing untranslated or legacy Shopify translation strings (`t:sections...`). 
- **Preserve IDs**: NEVER alter a setting's `"id"` string (e.g., `items_resp`) when modernizing a section, to prevent wiping the merchant's saved Customization Panel data.
- **Deep Block Auditing**: Ensure nested blocks (e.g., Slider slides, Tabs) have clear names and their internal settings are well-grouped so the parent-child relationship in the Shopify admin is highly scannable.

## Core JS Architecture ("Big Bang" Vanilla ES6 Framework)
- The legacy `common.js`, `product-page.js`, and all minified dependencies (including `tiny-slider` and polyfills) are officially abandoned.
- **Custom Elements Pattern**: All interactive functionality is now handled by Web Components housed in the new `theme-modern-core.js` framework. 
  - Standard features must use native OS 2.0 tags like `<native-slider>`, `<variant-select>`, and `<quantity-input>`.
  - No dependencies. Use pure ES6 classes extending `HTMLElement`.
- **Phase B Completion**: As of this refactor, zero legacy `<slider-component>` or `set-tns-config` slider footprints remain. The entire theme relies exclusively on CSS Scroll-Snap Native sliders with injected CSS flex gaps.

## Responsive Grid Variable Migration
- **Abolish Bootstrap Grid Logic**: Legacy grid classes (`row`, `col-sm-`, `col-md-`) and the `set-item-per-row.liquid` sizing engine are deprecated.
- When generating responsive grids from the `items_resp` comma-separated setting (e.g. `6,5,3,2`):
  1. Parse the string into an array in Liquid.
  2. Inject actual CSS variables directly into a `{% style %}` block mapped to `#section-{{section.id}}` (e.g., `--items-per-row-desk: 6;`).
  3. Use modern CSS `flex` or `grid` with `gap` to automatically size the child elements in the global CSS (or injected CSS chunk) via calc functions.
