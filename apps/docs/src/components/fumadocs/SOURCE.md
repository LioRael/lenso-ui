# Documentation shell sources

The docs app uses TanStack Start and Vite. The locale docs route composes
`DocumentationSiteLayout` from `@lenso/docs/client`; article routes use
`DocumentationArticle` from `@lenso/docs/react`.

`src/lib/source.ts` owns the authored page and navigation lookup. Search uses
Fumadocs providers and search APIs through the shared documentation package;
`ui/search-dialog.tsx` selects the locale's `/search/<locale>.json` index.
Dependency versions are recorded in the package manifests.

Presentation maps and layouts are maintained in `packages/docs/presentation`.
Components, themes and interactions follow the current Lenso contracts, Base UI
and StyleX. The component overview uses local descriptions and links rather
than upstream-hosted thumbnails.

Live preview source panes read the local demo module and its relative helpers.
The example catalog and generated live manifest own registration. Historical
upstream captures and layout measurements do not establish current behavior or
visual acceptance; use the checks in
[`CONTRIBUTING.md`](../../../../../CONTRIBUTING.md).

Retained adaptations keep their original copyright and license terms. Their
pinned sources, modification descriptions and full license texts are in
[`THIRD_PARTY_NOTICES.md`](../../../../../THIRD_PARTY_NOTICES.md) and the
[documentation package notices](../../../../../packages/docs/NOTICE.md).
