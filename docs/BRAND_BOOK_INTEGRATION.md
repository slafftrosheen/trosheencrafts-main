# Brand Book integration

Source: `Trosheen-Brand-Book-v2.pdf` (33 image-based pages; the internal page headers identify Brand Book v3). All pages were visually reviewed. The book supplies design guidance; proposed operational changes were assessed against the actual implementation and the user's decisions.

## Asset audit

`BrandAssets/` contains 231 files: 158 PNG, 69 SVG, two TTF fonts, one ICO and one CSS token sheet. It includes transparent logo variants, favicon/app icons, 46 individual icons, editorial/web banners, social/print layouts, Fraunces and Jost, and the exact palette tokens.

- Palette: Spruce `#24412F`, Lichen `#8C9A7B`, Kiln `#8E5636`, Gilt `#B89150`, Linen `#F2EDE3`, Basalt `#1F1D1A`.
- Website imagery uses clean hero originals and photographic halves of supplied banners. Crops and WebP encoding preserve colour; text, labels and buttons are live translated UI.
- Social and print compositions remain source assets, rather than being presented as website controls or available stock.
- Fonts are served locally. Original source assets and the book remain untouched.

## Implemented

- Shared site colours, local Fraunces/Jost fonts, restrained heading weights, 2px corners, visible focus states and responsive layouts.
- Official transparent seal/lockup artwork, favicon/app icons, manifest identity and share artwork; public brand name is Trosheen.
- Five homepage sections: hero, trust links, editorial collections (including configured promotions), family story, newsletter. Removed duplicated story sections and prominent unsupported numerical/zero-waste claims from the homepage.
- About-page photo/text introduction and shared styling across Shop, Gallery, Journal, Care, Contact and commerce pages. Existing long-form family stories remain intact.
- New brand copy has complete LV/EN/RU/PL/UK translations. Latvian remains the default; explicit saved language preferences remain authoritative. Journal/Care labels and footer legal links are translated.
- Existing Gallery, custom constructor and commerce flows retained, following the user's explicit decision. No enquiry-form replacement or route removals. Legacy `/constructor` links now redirect to the existing custom tab at `/shop?view=custom`.
- Contact information continues to come from Admin configuration. Public configuration was checked read-only on the live site; no production settings were changed. Placeholder phone text is hidden in the footer while genuine configured numbers render normally.
- Fixed continuous typing in newsletter fields by rendering their form as part of the existing component, rather than remounting a nested component for every keystroke. Submission messages are translated; API requests are unchanged.

## Media compatibility

Current editable placements reuse existing persisted keys:

| Key | Placement |
| --- | --- |
| `siteLogo` | Header/footer/Admin logo override; otherwise tone-specific supplied SVG artwork |
| `hero` | Homepage photo; clean mobile image used when no custom hero is configured |
| `storyHeritage` | First collection photo |
| `storyMakers` | Second collection photo |
| `familyFeature` | Family story photo |
| `shopFeature` | Homepage newsletter photo |

The editor and its migration action use only these six current placements. Legacy `storyLegacy`, `storyPhilosophy`, `materials`, `craftsmanship` keys remain accepted/preserved server-side but are no longer presented as active homepage placements. Existing URLs remain authoritative; reset a slot in Admin to use its new brand default. No R2 files were uploaded or deleted.

## Validation

- `npm run build`: passed, client and server. Existing bundle-size warnings remain.
- Whole-repository `tsc --noEmit`: fails with diagnostics in untouched files (legacy image props, Admin types, default target, missing declarations and server route types). No diagnostics were reported for this batch's changed files. This is not a clean repository-wide typecheck.
- Browser: 38 checks covering homepage in all five languages at 320/768/1024/1440px, eight public routes at 390/1440px, mobile Gallery navigation and continuous newsletter typing/submission. No JavaScript page errors, horizontal overflow or broken final-page images in those checks.
- Browser API responses were intercepted with controlled data, including empty catalogue/journal/gallery states. Newsletter success was mocked; no real subscriber was created. This does not validate payments, production writes, uploads or a live constructor configuration.
- Design diagnostic: 9/10 (7 of 8 Refactoring UI checks); inherited pages still contain arbitrary spacing values outside the constrained shared scale. No claim of a complete visual rewrite of every legacy component.

## Review choice

The user selected a desktop photo beside a separate Spruce text panel. The clean 1920×1080 desktop asset now sits beside live Linen text and Gilt/outline buttons, so translated copy never overlays a product. Mobile retains its separate photo and Linen copy panel.

Changes are local, not committed, pushed or deployed.
