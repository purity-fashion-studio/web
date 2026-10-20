# Contributing

Keep changes focused, reviewable and consistent with the existing product and
design-system contracts.

## Workflow

1. Branch from an up-to-date `main`.
2. Use a short branch name: `feat/...`, `fix/...`, `docs/...`, `test/...`,
   `refactor/...`, `ci/...`, or `chore/...`.
3. Make one logical change at a time.
4. Run the narrowest relevant checks.
5. Open a pull request. Direct pushes to `main` are not part of the normal
   workflow.
6. Merge only after required checks are green and review notes are resolved.

Any exception to repository, QA, design-system, accessibility or release rules
requires explicit, one-time approval from the repository owner. An exception
does not change the standing rule.

## Commits and pull requests

Use Conventional Commits for commits and PR titles:

```text
<type>(optional-scope): imperative summary
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`,
`build`, `ci`, `chore`, and `revert`.

- Keep commits buildable and scoped to one logical change.
- Explain non-obvious motivation in the commit or PR body.
- Include screenshots for visual changes and cover affected locales and widths.
- Declare environment, migration, content-contract and deployment changes.
- Never commit secrets, `.env.local`, build output, test artifacts, or unrelated
  formatting churn.

## Engineering contract

- Read the matching guide in `node_modules/next/dist/docs/` before changing
  Next.js behavior.
- Reuse existing dependencies, components, tokens and content models.
- Keep TypeScript strict and validate untrusted input at boundaries.
- Keep user-facing copy localized in `messages/` or the typed content model.
- Preserve semantic HTML, keyboard access, focus states, contrast, reduced
  motion and responsive behavior.
- Use shadcn semantic tokens and canonical `components/ui/*` APIs. Do not add
  parallel color systems, direct UI colors, local primitive forks, Lucide, or
  page-specific primitive variants.
- Do not add dependencies, abstractions or configuration without a concrete,
  documented need.

## Verification

For most changes:

```bash
pnpm readiness:mvp
```

For routes, UI, forms, navigation or responsive behavior:

```bash
pnpm test:e2e
```

For release-impacting changes:

```bash
pnpm qa:all
```

Warnings are treated as failures. Do not silence, loosen, skip or regenerate a
gate merely to make it pass. Visual baseline changes require explicit manual
review.
