# Homepage Liquid Glass redesign

Reviewed November 7, 2026, using the local Vite development application at
`http://127.0.0.1:4337/` and `/cn`. This is development evidence, not production,
release, native Apple parity, or real-device acceptance.

## Design decisions

Audience: React developers evaluating Lenso and finding its documentation.
Primary task: understand the library, try its controls, then open the relevant guide.

Design read: a component-library introduction with Apple-inspired hierarchy and
purposeful Liquid Glass. ENERGY 2 / RHYTHM 2 / MOTION 1.

Two arrangements were considered: retaining the centered headline and expansive
component mosaic, or pairing an editorial introduction with one working example.
The latter gives the primary action and a useful interaction equal first-screen
visibility on desktop. Mobile retains the same reading order in one column.

- Layout: the split introduction leads into open, divided explanatory rows, so the page demonstrates a product rather than repeating feature cards.
- Typography: the existing Lenso body font and a restrained weight scale connect the homepage to its actual components. Responsive sizes preserve translated text.
- Color: existing semantic labels and tint preserve appearance and custom-theme inheritance. The primary action darkens the current tint to retain white-label contrast; the secondary action uses the text tint on the page surface.
- Spacing: one grid owns the hero gap; shared leading guides align the explanatory rows and footer. Smaller internal gaps connect labels and supporting copy.
- Materials: only the example's favorite action and scene selector float over photographic content. The page and explanatory content have ordinary surfaces. Existing global preference controls retain their shared materials.
- Photography: existing licensed sample photos supply real detail behind the glass; labels explicitly identify this as an interactive example. No new assets or invented product/customer claims were introduced.
- Image scrim: darkened regions preserve legibility for the white photo labels and title across the three scenes. The image remains visible in the central content region.
- Icons: the heart represents the persistent favorite toggle. Native tab labels identify scene selection without decorative icons.
- Motion: native shared control feedback follows activation; no ambient or scroll-driven animation was added.
- Navigation: the old homepage's unstyled upstream navigation was replaced with semantic StyleX navigation and Lenso Disclosure. Search, preferences, locale controls and existing destinations remain available.

The old application demos remain available in their existing application/theme
surfaces; the homepage no longer mounts their full mosaic and hidden panels.
Favorites are intentionally local example state, retained while switching scenes
and reset when the homepage unmounts.

## Evidence

| Area                           | Observed scope                                                               | Result                                                                                                                                                                                                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chromium and WebKit            | English and Chinese; 1440px desktop in light/dark; widths 320, 390 and 768px | No horizontal document overflow; screenshots inspected for hierarchy and wrapping                                                                                                                                                                                 |
| Scene selector                 | All three scenes; pointer activation; ArrowRight and Home keys               | Selection and associated panel update correctly                                                                                                                                                                                                                   |
| Favorite                       | Toggle on/off for selected photo                                             | `aria-pressed` follows state; standard 50px icon-only glass button                                                                                                                                                                                                |
| Mobile navigation              | Disclosure at 390px in both locales and engines                              | Opens/closes and exposes real navigation links                                                                                                                                                                                                                    |
| Search and preferences         | Chromium desktop                                                             | Search opens and Escape dismisses; theme popover opens; appearance controls update the document                                                                                                                                                                   |
| Language                       | Chromium desktop                                                             | Chinese menu item navigates to `/cn`                                                                                                                                                                                                                              |
| Destinations                   | All nine unique English local link destinations requested                    | HTTP 200, including canonical `/getting-started/architecture` composition guide                                                                                                                                                                                   |
| Additional adaptation          | Chromium, Chinese at 390px                                                   | RTL and reduced motion retain layout; doubled root font-size has no horizontal document overflow, but is not a full browser text-zoom audit                                                                                                                       |
| Contrast                       | Default theme, light/dark, browser-resolved foreground/background colors     | Primary action 6.26:1 / 5.79:1; text links 5.02:1 / 6.76:1; supporting labels 7.81:1 / 9.36:1. Secondary action uses the same text tint against the page. Photo text reviewed over the authored scrim; not a per-pixel audit of all glass states or custom themes |
| Format/lint                    | Six changed homepage component/style files                                   | oxfmt and oxlint pass                                                                                                                                                                                                                                             |
| Docs typecheck                 | Application plus scripts                                                     | 2,245 application files and 42 script files pass                                                                                                                                                                                                                  |
| Existing docs regression suite | `bun run --filter @lenso/ui-docs test`                                       | 99 pass, 0 fail                                                                                                                                                                                                                                                   |
| React Doctor                   | Changed-scope docs scan                                                      | 83/100, 23 warnings in other files; no findings in the six homepage files. Existing broad worktree changes mean this is not an isolated before/after score                                                                                                        |

Screenshots are in the local visualization directory:
`/Users/leosouthey/.codex/visualizations/2026/11/06/01a1b223-ead1-7131-9aac-8dab90fa59a6/home-redesign/`.
The directory contains both locales in desktop light/dark and mobile dark.

## Design delivery gate

- Hard gate PASS for the reviewed homepage scope: real local link routes respond; example selection and favorite activation work; mobile geometry and keyboard selection were exercised; no fabricated statistics, testimonials or new decorative assets. Static introduction content has no loading/empty workflow; the photos use descriptive alt text.
- Purpose gate PASS: material, shadow, scrim, typography, icons, spacing and color each have the role recorded above; the example uses two floating glass control surfaces and no page-wide glass treatment.
- Liveliness PASS: declared 2/2/1 dials appear as a prominent introduction, photographic product example, varied editorial rows and interaction-only feedback.
- Craftsmanship PASS within the recorded scope: bilingual real content, meaningful actions, shared native controls, theme adaptation and responsive geometry were exercised. Remaining verification limits are explicit below.

## Limits and follow-up

WebKit emitted two `ResizeObserver loop completed with undelivered notifications`
errors during the multi-viewport run. The tested interactions and geometry still
passed. Chromium reported no page errors in that run. This does not establish
that shared glass components are free of resize-observer issues; no shared
observer implementation was changed in this page redesign.

The pre-existing port-3000 preview stopped answering during review. The root
`dev:docs` preparation/build passed, but its server could not bind the occupied
port. The maintained `.agents/preview` entrypoint then started an owned dev server
on the verified free port 4337. The original process was not stopped.

Production export/build, real Safari/iPhone, screen reader, comprehensive browser
text zoom, every named theme, and pixel-wise photo/glass contrast across all
states were not verified. No public API, package material recipe, primitive
source, release, landing or deployment was changed by this task.
