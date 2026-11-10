# Lenso UI for Exact

Private, initial **Web** implementation for Expo Exact. Contract components own
their structure and Exact actions; a Web hatch applies shared Lenso StyleX tokens
and the existing glass renderer. There is no React runtime in this adapter.

Validated against Exact commit `956ae33a35ffa5313d7be3cebc55ed84f9480e0a`.
This package does not yet implement an Exact iOS or Android adapter.

## Components

Exact currently requires every declared prop at a call site.

| Component     | Props                                                     | Children |
| ------------- | --------------------------------------------------------- | -------- |
| `Theme`       | `appearance`: `light` or `dark`                           | Yes      |
| `Backdrop`    | None; call as `Backdrop()`                                | Yes      |
| `Button`      | `label`, `press`, `disabled`, `size`, `variant`, `testId` | No       |
| `Glass`       | `testId`                                                  | Yes      |
| `GlassButton` | `label`, `press`, `disabled`, `size`, `variant`, `testId` | No       |

Both buttons accept `sm`, `md` and `lg` sizes. Button variants are `prominent`,
`bordered` and `borderless`; GlassButton variants are `default` and `prominent`.
`press` takes an Exact action. These are native HTML buttons, including keyboard
activation and disabled behavior. Button content is currently a text label.

`Glass` uses the small material profile with 16 px padding and a 24 px radius.
Use Contract layout containers around it to place or size the surface.
`Backdrop` marks content eligible for the shared renderer's backdrop collection;
it does not guarantee that arbitrary DOM content can be replayed on WebKit.

## Consumer setup

Build the package in this workspace:

```sh
bun run --cwd packages/ui-exact build
```

Install or link `@lenso/ui-exact` in the consumer. Its default export is the
Contract entry, resolved by Exact rather than JavaScript:

```text
use Theme, Button from "@lenso/ui-exact"

component App
  state count = 0
  action increment
    count = count + 1
  view
    Theme(appearance="light")
      Button(label=`Count: ${count}`, press=increment, disabled=false, size="md", variant="prominent", testId="count")
```

Merge these declarations into the application's `app.json`:

```json
{
  "hatches": { "lenso-ui": ["web"] },
  "data": ["theme", "lenso-backdrop", "lenso-kind", "lenso-size", "lenso-variant", "lenso-disabled"]
}
```

Before the Exact build, stage the built browser assets from a Bun build script:

```ts
import { stageWeb } from "@lenso/ui-exact/stage";

await stageWeb("/absolute/path/to/exact-app");
```

Exact copies page modules without resolving browser package imports. In
`modules/web/index.js`, use the staged relative entry:

```js
export { element, elementEnded } from "./lenso-ui/browser.js";
```

If the app already exports hatch callbacks, dispatch `lenso-ui` handles to these
functions and keep the existing callbacks for other hatch words. Restage after
rebuilding this package. The staging helper only writes `modules/web/lenso-ui`.

The browser entry waits for its stylesheet before exposing hatch callbacks.
Exact loads page modules after first paint, so this does not promise a styled
first frame. An application needing that should also link the staged
`modules/web/lenso-ui/web.css` in its HTML delivery layer.

## Verification

```sh
bun run --cwd packages/ui-exact typecheck
bun run --cwd packages/ui-exact build
EXACT_ROOT=/absolute/path/to/exact bun run --cwd packages/ui-exact test:browser
```

The browser check requires an initialized Exact checkout with its Web compiler
and matching toolchain, plus the Docs workspace's Playwright browsers. It does
not install Exact or change the workspace's Rust toolchain. Use `TEST_BROWSER`
to select `chromium` or `webkit`, and optionally `CHROMIUM_CHANNEL=chrome` for
installed Chrome. These integration checks are separate from ordinary package
builds, which require no Rust toolchain.

`PLAYWRIGHT_MODULE` can point to an installed Playwright package with matching
browser binaries when the Docs dependency has changed locally.

The check builds a real consumer using the distributable Contract and browser
assets. It covers keyboard/click activation, reactive labels, disabled behavior,
size and theme changes, and glass disposal/recreation. Screenshots are written
under `.cache/example`. Browser layout checks are not physical-device or GPU
performance qualification.

## Current boundary

This is an initial integration slice, not the full Lenso React component API.
It does not yet include elastic motion, icons, loading state, groups, overlays,
or native controls. Shared glass rendering retains its existing browser
limitations; using Exact Web does not bypass WebKit or establish a performance
improvement. Generated assets include the repository's third-party notices.
