# PURITY Design Rules

The product uses shared shadcn primitives, semantic tokens and localized content.

## Structural Patterns

- Compact navigation: short category labels, quiet uppercase rhythm, and visible language controls.
- Visual-first hero: one strong editorial claim, one visual slot, one primary CTA and one secondary path.
- Category rails: repeated service/product cards in tight grids with restrained labels and clear onward links.
- Service grid rhythm: 2-3 column desktop grids, single-column mobile stacks, stable card dimensions.
- Maison/about block: one full-width studio band explaining method, team, and craft.
- Dense footer: brand mark, location/contact context, utility links, and language control without marketing clutter.

## PURITY Mapping

- `BrandLogo` and `LanguageSwitcher` form the header utility row.
- `EditorialHero`, `ImageFrame`, and `FeatureList` provide shared imagery and content compositions.
- Shared page compositions and the site footer keep behavior consistent across localized routes.
- Payload provides all public copy, contacts, navigation, commercial labels and media metadata at runtime.

## Guardrails

- Use only product assets with approved usage rights; generated imagery is never client proof.
- Preserve keyboard access, focus states, responsive behavior and locale parity.
- Keep design-system checks in `scripts/check-qa.ts` and `scripts/check-design-tokens.ts` passing.
