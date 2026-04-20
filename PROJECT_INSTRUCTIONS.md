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
