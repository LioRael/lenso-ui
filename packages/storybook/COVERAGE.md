# Storybook source and browser coverage

The visual reference is HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`. Source adaptations retain Apache-2.0
notices; original SVG licenses remain beside their vectors.

`pinned-story-files.json` retains original upstream paths and the source revision.
The migration inventory and its manual reviewed-family list are retired.
A source adaptation or imported snippet is not proof of a working scenario;
current `storybook-static/index.json` lists runnable entries, not parity claims.

## Executable browser coverage

Build packages normally and build Storybook once. Every suite below consumes
the same production `storybook-static` artifact:

```sh
pnpm --filter @lenso/storybook build
pnpm --filter @lenso/storybook test:browser
```

Pass suite names to narrow an existing artifact. `STORYBOOK_STATIC` overrides
the artifact location. The browser runner never builds packages or Storybook.

| Suite           | Retained assertions and limitations                                                                                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `display`       | DOM mounts, both themes, meter/progress semantics, spinner/full-width geometry, controlled text fields, InputGroup workflows, avatar fallbacks and scroll shadows |
| `actions`       | [Loading, disabled overrides, toggle selection and toolbar focus](stories/ACTIONS-EVIDENCE.md)                                                                    |
| `navigation`    | [Controlled navigation, overflow, indicators, refs and dynamic StyleX](NAVIGATION-EVIDENCE.md)                                                                    |
| `choice`, `rtl` | [Native forms, accessible names and RTL slider keys/geometry](CHOICE-EVIDENCE.md)                                                                                 |
| `overlay`       | [Dismissal, focus, custom Portals, scrolling and placement](OVERLAY-EVIDENCE.md)                                                                                  |
| `menu-toast`    | [Menu/submenu focus, pointer-hold cancellation, toast queues and native F6](MENU-TOAST-EVIDENCE.md)                                                               |
| `selection`     | [Selection, required FormData, async query races and windowed keyboard navigation](SELECTION-EVIDENCE.md)                                                         |
| `form`          | [Clipboard, locale, validation, loading/reset and invalid-outline observations](FORM-WORKFLOW-EVIDENCE.md)                                                        |
| `collection`    | [Table/tag selection, removal, resizing, loading and virtualization](COLLECTION-EVIDENCE.md)                                                                      |
| `calendar`      | [Selection, locale, constrained dates and multi-month overflow](CALENDAR-EVIDENCE.md)                                                                             |
| `date`          | [Segments, contextual labels, forms and picker focus](DATE-TIME-EVIDENCE.md)                                                                                      |
| `color`         | [Models, channels, validation and portalled themes](COLOR-EVIDENCE.md)                                                                                            |

`Local/Contracts` contains additional integration fixtures, not upstream
scenarios. Form, navigation and RTL slider regressions no longer have separate
application builds. The one real installed UI consumer belongs to
`@lenso/testing test:package`, which checks packed exports, types, SSR and
production CSS without rebuilding workspace packages.

## Boundaries

- Base UI owns ordinary controls and overlays. Native dismissal/focus policies
  are not normalized to the upstream React Aria defaults.
- React Aria owns contextual date/time/color models and their supporting parts.
- Theme selection sets native `data-theme`; compiled StyleX combines package
  raw rules and consumer declarations in one processing pass.
- Source image/network-dependent proofs distinguish transport failure from
  behavior failure. Replay uses genuine original bytes, not placeholders.
  Avatar.Fallback's deliberately invalid image is an explicitly scoped exception.
- Styled render composition can still replace a parent's dynamic width class;
  the navigation proof reports that known discrepancy separately.
- Recorded invalid-outline observations are not passing visual assertions.
  Component-local regressions guard the corrected invalid group feedback.
- Source copy buttons or links without handlers are reference content, not
  business workflows.
- These Chromium scenarios do not certify exhaustive screen-reader operation,
  touch hardware, every breakpoint/RTL placement, Firefox/WebKit, motion curves,
  source pixel parity or WCAG AA. Exact upstream colors include known contrast
  failures.

Coverage notes document what runners assert and what remains unproved. Current
acceptance requires running them against the current artifact; historical
timings, candidate hashes and old provider paths are not acceptance authority.
