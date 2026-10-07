# Docs UI regression scope

The visual reference is HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`. Its notebook composition and final
CSS overrides guide local presentation; Fumadocs UI/core 16.9.0 own the shell's
interactions. Reference adaptations retain Apache-2.0 notices, and Fumadocs' MIT
license remains in `src/components/fumadocs/LICENSE.FUMADOCS`.

Keep these boundaries when changing the shell:

- Native TOC observation, active headings, scrolling and mobile disclosure.
- Locale-separated authored search, Mandarin tokenization, native keyboard/IME
  handling, scrolling and focus restoration.
- Actual paragraph matches with rendered heading IDs, not page-wide snippets.
- Reduced-motion behavior and portalled theme propagation.
- Semantic Markdown/API tables, keyboard-focusable overflow and exact copying.

The scoped geometry regressions exist because popup clipping, doubled trigger
spacing and TOC visibility changes can occur without a document-level overflow
failure. Server-rendered StyleX declarations must remain in the source union.

## Reproduce

With Node 26.10 and pnpm 12.9, build and serve the current docs export:

```sh
pnpm --filter @lenso/ui-docs build
pnpm --filter @lenso/ui-docs start
# From apps/docs in another terminal:
node test/docs-ui-regressions.browser.mjs
node test/fumadocs.browser.mjs
pnpm test:api-browser
node test/components-overview.browser.mjs
```

`LENSO_DOCS_TEST_URL` selects the static server. Browser checks cover EN/CN,
light/dark, desktop/mobile, short viewports, breakpoint changes, keyboard/IME,
loading/empty results, focus return, native table overflow and copied Markdown.
The existing source-color contrast limitation is not a claim of WCAG compliance.

Results and screenshots are run-specific ignored artifacts. Passing this scoped
matrix does not prove upstream pixel parity or the full component example matrix.

The component-overview proof also runs from `scripts/browser-check.mjs`. It checks
every public family has exactly one gallery link, occupied categories render,
thumbnail delivery/theme selection, preview geometry, mobile reading order,
keyboard navigation and reference-link hover/focus in EN/CN light/dark at 390px
and 1440px. It decodes the representative Button thumbnail, not every remote CDN
image. Static reference thumbnails are not local demo coverage.
