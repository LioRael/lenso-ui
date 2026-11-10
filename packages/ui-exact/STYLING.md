# Caller StyleX rules

Caller styles compose with the component's maps before StyleX produces classes.
They are used by both the build-time selectors and the browser hatch. This keeps
first-frame presentation and initialized presentation consistent, including
property removal and conditional styles.

## Define and compile rules

Create a consumer-owned module using the same StyleX compiler/runtime version as
the library. Each `PresentationRule` has a component `kind`, optional stable
Exact `testId`, and `xstyle`. Omit `testId` to style all instances of that kind.
Rules run in array order; later maps override earlier maps through normal StyleX
composition. A target id does not automatically increase rule priority.

```ts
import * as stylex from "@stylexjs/stylex";
import type { PresentationRule } from "@lenso/ui-exact/presentation";

const styles = stylex.create({
  rounded: { borderRadius: 16 },
  clear: { backgroundColor: null },
});

export const styleRules = [
  { kind: "skeleton", xstyle: styles.rounded },
  { kind: "skeleton", testId: "preview-placeholder", xstyle: styles.clear },
] satisfies readonly PresentationRule[];
```

Compile that module with the consumer's StyleX build. Arrays, conditional maps,
custom properties, media queries and pseudo states remain StyleX features.
A `null` entry removes the corresponding earlier StyleX property; it does not
force the CSS `initial` value over native or inherited presentation. Keep
conditional styling inside the StyleX maps. Target test ids identify stable
instances, rather than acting as a dynamic selector language.

The built-in registry can be inspected with `presentationCases()` from
`@lenso/ui-exact/presentation`. Kinds use names such as `button`, `skeleton`,
`toggle-button` and `progress-circle-track-circle`. Theme/Backdrop layout nodes
without a presentation kind use their existing Contract APIs.

The library reserves the `lenso-exact-` class prefix. Consumer compilation can
use StyleX's default prefix or a separate application prefix. Independently
compiled bundles can otherwise emit the same atomic class at different
specificities, causing a default value to defeat a hover or media rule.
`styleWeb` rejects caller CSS that redefines library classes.

## Stage the composed stylesheet

After building the library and compiling the consumer rule module, stage the
library as usual. Pass the compiled rules and the compiler-emitted caller CSS to
`styleWeb` before the normal Exact Web build:

```ts
import { stageWeb, styleWeb } from "@lenso/ui-exact/stage";
import { styleRules } from "./modules/web/style-config/index.js";

const staged = await stageWeb(process.cwd());
const css = await Bun.file("./modules/web/style-config/assets/stylex.css").text();
await styleWeb(staged, { rules: styleRules, css });
```

The paths in this snippet match the checked consumer's Vite build. Other
compilers may emit a different CSS path; pass their actual output. This step
runs in Bun, like the existing staging helpers. It reads the staged package's
own compiled maps and `web.atomic.css`, combines caller CSS, and replaces the
staged `web.css`. It never appends a second set of aliases to an already
processed stylesheet. Repeating the same inputs produces the same CSS.

The helper generates default and targeted recipe cases, excluding targeted
instances from conflicting default aliases. It then applies the same compact
selector generation as the core build. Classes referenced by a recipe must
have CSS definitions: missing compiler output, unknown kinds, duplicate library
classes and unsupported inline values fail before the previous staged CSS is
replaced. Rules that need no new CSS, such as pure `null` removals, may pass an
empty CSS string.

Continue to use `withLensoWeb` for manifest declarations. After Exact builds the
consumer, call `linkWebStyles(output)` so its blocking stylesheet hash includes
the composed CSS. See INITIAL_STYLES.md for the generated-page integration.

## Use the same rules in the page hatch

The browser page module imports that same compiled rule module:

```js
import { createWebHatch } from "./lenso-ui/browser.js";
import { styleRules } from "./style-config/index.js";

export const { element, elementEnded } = createWebHatch(styleRules);
```

The factory keeps Exact's nodes, actions, native attributes, state and existing
Lenso behavior controllers. It only supplies the matching maps to presentation
composition. Base and caller classes are reconciled and cleaned up together.
Use the same static rule set in both stages. Changing rules requires rebuilding
the stylesheet and page module, as with compiled StyleX generally.

The low-level `element(handle, {xstyle})` API composes maps at callback time.
Use `createWebHatch` with `styleWeb` for the full first-frame path. No separate
CSS request is needed: the browser entry still reuses the blocking `web.css`.

## Scope and verification

The mechanism supports the registered recipe kinds. SVG circle leaves retain
their declarative ID-based path because Exact does not admit hatches or data
words on those leaves; their composed CSS remains active after initialization.
Contract-authored inline geometry and renderer/controller-owned inline values
retain normal CSS priority. This API does not replace native value models or
measurement/motion controllers.

Dynamic StyleX function results with inline values are currently refused rather
than silently dropping those values or promising an unstyled first frame. Use
registered static recipes, CSS variables already defined by the application, or
existing Contract geometry/value props. Arbitrary JavaScript-generated inline
values need a separate declarative adapter.

The installed consumer executes [example/styles.ts](example/styles.ts) through a
separate Vite/StyleX build. Chromium and Playwright WebKit verify first-frame
styles with the page hatch blocked, then class composition, responsive radius,
hover feedback, ordered global/instance maps, null removal of background and
radius, custom toggle tint after pointer release, and styled SVG leaves. The
consumer compares all 1017 composed cases, alongside the ordinary behavior,
keyboard, motion and disposal suite. Core generation retains 881 recipes.
These are Web integration checks, not native or device-performance acceptance.
