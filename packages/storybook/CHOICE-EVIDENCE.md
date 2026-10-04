# Choice Storybook reconstruction

Authority: HeroUI v3.2.6, immutable commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`.
The complete files reviewed were
`https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/<family>/<family>.stories.tsx`
for each of the six families below. Documentation examples were anatomy
references, not substitutes for these story scenarios.

## Exact source export map

Each case-sensitive export maps to the same export in
`stories/<family>.stories.tsx`. These are scenario implementations, not aliases
to a basic example. Source `argTypes` are empty except Slider: `isDisabled`
boolean and `orientation` select with `horizontal`/`vertical` options. Source
stories do not supply story-level `args`; Slider continues forwarding controls,
with `isDisabled` translated to the native `disabled` prop at the story boundary.
Local `Components/<Family>` titles retain the established local category.

| Family         | Export                    | Reviewed scenario                                                                             |
| -------------- | ------------------------- | --------------------------------------------------------------------------------------------- |
| checkbox       | Default                   | `terms`, accept terms and conditions                                                          |
| checkbox       | Variants                  | Primary/secondary names, headings, descriptions                                               |
| checkbox       | WithDescription           | Terms/privacy description                                                                     |
| checkbox       | WithCustomIndicator       | Selected heart/plus SVGs; indeterminate line SVG                                              |
| checkbox       | Indeterminate             | Select all, mixed state and description                                                       |
| checkbox       | ControlOnly               | Accessible name Accept; `control-only`                                                        |
| checkbox       | Disabled                  | Feature, disabled activation, coming-soon description                                         |
| checkbox       | Controlled                | Initially true; notifications state and Enabled/Disabled status                               |
| checkbox       | RenderProps               | Dynamic Terms accepted/Accept terms and accompanying description                              |
| checkbox       | Invalid                   | Required agreement and manual source error                                                    |
| checkbox       | Validation                | Required newsletter and source custom validator/error                                         |
| checkbox       | FullRounded               | 12/16/20/24px round controls; 8/10/10/16px checkmarks                                         |
| checkbox       | FeaturesAndAddOnsExample  | Email/SMS/push values, source notification cards, descriptions/icons                          |
| checkbox-group | Default                   | Interests coding/design/writing, group help and per-item descriptions                         |
| checkbox-group | WithCustomIndicator       | Features notifications/newsletter with source cross SVG                                       |
| checkbox-group | Indeterminate             | Initially coding; controlled select-all/all/none transition                                   |
| checkbox-group | Validation                | At-least-one preference; email/sms/push; native FormData alert                                |
| checkbox-group | Controlled                | Initially coding/design; native group selection and Selected summary                          |
| checkbox-group | Disabled                  | Feature1/feature2; group disabled state and source descriptions                               |
| radio-group    | Default                   | Plan basic/premium/business; initially premium; source descriptions                           |
| radio-group    | Variants                  | Primary/secondary option1/option2 groups and source descriptions                              |
| radio-group    | PerRadioInvalid           | Only Basic Plan invalid/required; source account error; premium selected                      |
| radio-group    | WithCustomIndicator       | Source check character, mounted only for selected item                                        |
| radio-group    | Orientation               | Horizontal starter/pro/teams; initially pro                                                   |
| radio-group    | Validation                | Required subscription; source error and native FormData alert                                 |
| radio-group    | Controlled                | Initially pro; Selected plan summary                                                          |
| radio-group    | Uncontrolled              | Native defaultValue pro; Last chosen plan observes changes                                    |
| radio-group    | Disabled                  | Initially pro; native group disabled state and rollout description                            |
| radio-group    | DeliveryAndPaymentExample | Standard/Express/Super Fast prices/times; Mastercard/Visa/PayPal cards; express/visa defaults |
| switch         | Default                   | Enable notifications, initially unchecked                                                     |
| switch         | Disabled                  | Disabled Enable notifications                                                                 |
| switch         | DefaultSelected           | Initially selected Enable notifications                                                       |
| switch         | DisabledDefaultSelected   | Selected/disabled control-only with source accessible name                                    |
| switch         | Controlled                | Initially false; native checked callback and on/off summary                                   |
| switch         | WithoutLabel              | Control-only with source Enable notifications accessible name                                 |
| switch         | Invalid                   | Required notifications and manual source error                                                |
| switch         | Validation                | Required terms-switch and source validator/error                                              |
| switch         | Sizes                     | sm/md/lg with Small/Medium/Large labels                                                       |
| switch         | LabelBefore               | Source label precedes control                                                                 |
| switch         | WithDescription           | Public profile and source privacy description                                                 |
| switch         | WithCustomStyles          | Power/check icons, blue/cyan 51x31px control, 27px thumb and source glow                      |
| switch         | WithIcons                 | Source lock/microphone/check/darkMode/notification identities, icons, state colors            |
| switch         | RenderProps               | Native checked state drives Enabled/Disabled label                                            |
| switch-group   | Default                   | Notifications/marketing/social native named inputs                                            |
| switch-group   | Horizontal                | Horizontal group; source short labels and overflow behavior                                   |
| switch-group   | Form                      | Named on values; newsletter initially selected; source FormData alert                         |
| slider         | Default                   | Volume 30, native label/output/control/track/fill/thumb                                       |
| slider         | Vertical                  | Volume 30, vertical orientation and source frame decorators                                   |
| slider         | Disabled                  | Disabled Volume 30, controls forwarded last                                                   |
| slider         | Range                     | 100/500, USD, 0–1000, step 50; native multi-thumb state                                       |

Total: **13 + 6 + 10 + 14 + 3 + 4 = 50** source exports.
The pre-existing four Checkbox and five Switch development states are retained
as `LocalArchived*` and `LocalEmail*`, respectively. They are not counted as
source parity or in the 100 source-story mount checks. Total local exports: 59.

## Native adaptation

- `choice-fixtures.tsx` assembles the existing concrete Checkbox, Radio and
  Switch parts. It keeps native checked/value callbacks, render-state objects,
  hidden inputs, keyboard contracts and component-specific StyleX composition.
  It does not implement a substitute interaction model or public API.
- Group headings/help are explicit spans with unique IDs. Every item has its
  own label ID and description ID; group text cannot overwrite item names.
  Supporting spans reuse the existing label/description/supporting style maps.
- CheckboxGroup has no native `name` prop: each child input carries the source
  name and value. Required group validation uses an owned `TextField` with the
  native group array validator. RadioGroup owns its native name/required input.
  Standalone validation/invalid stories also use the owned field scope.
- Manual errors use `FieldError match={true}` and native invalid state. Custom
  validation errors use normal native matching and explicitly render the source
  validator's message, because Base UI Field.Error does not synthesize children.
  Standalone validation is native on-blur validation after changing a control;
  form validation is native submit/revalidate behavior.
- Base UI does not expose per-radio HTML `required`: the Basic Plan scenario
  retains per-item `aria-required` and native per-item field invalid/error state;
  group required submission is exercised separately by Validation.
- Base UI RadioGroup has no `orientation` prop: horizontal source layout uses
  scoped StyleX and `aria-orientation`, while native arrow-key behavior remains.
- Slider uses native `Slider.Label`/`Control` and maps source `formatOptions`,
  `minValue`/`maxValue` to `format`, `min`/`max`. Range thumbs come from native
  render-state values, not a fabricated fixed thumb count.
- Choice-specific custom styles are compiled StyleX; no Tailwind runtime,
  React Aria ordinary controls, dependency changes or generic family factory
  were introduced. The shared inventory/smoke/reviewedFamilies files are untouched.

## Verification

Executed with Node **24.18.0** in a scratch-only source mirror, using readonly
existing dependency links and locally rebuilt scratch distributions. Parent
source files and dependency/version/configuration files were not edited.

- Fresh styles and UI distribution builds, including declaration generation:
  passed.
- Strict Storybook TypeScript: passed.
- Production Storybook consumer build: passed. Bundler reports existing
  non-fatal `"use client"` module-directive notices.
- Whole-repository shared oxlint: passed with zero warnings/errors.
- Whole-repository shared oxfmt check: passed.
- `stories/choice-proof.mjs`: compares complete actual pinned upstream exports
  against local exports and renders **50 source scenarios x 2 themes = 100**
  production iframes, with no page errors.
- The same proof exercises both themes: controlled/uncontrolled checkbox and
  switch toggles, Space activation, disabled activation, indeterminate select
  all, native checkbox/radio required forms and resulting FormData alerts,
  switch form named values, manual errors, standalone custom validation,
  controlled/uncontrolled radio state and arrow keys, slider Home/End/arrows,
  vertical and multi-thumb slider values/output, and disabled slider keys.
- Geometry assertions cover rounded control/checkmark dimensions, custom
  switch dimensions/offset/colors, vertical track dimensions, six source cards
  and selected backgrounds, desktop layout and 390px mobile stacking/containment.
  Reduced-motion card transitions are checked.
- `stories/choice-rtl-proof.mjs`: separately production-builds the actual
  Default/Range slider story renders beneath **native Base UI DirectionProvider**.
  Both themes pass reversed ArrowRight/ArrowLeft semantics and increasing range
  values moving left. This is a scoped consumer, not a shared provider/config edit.

Replay against a production Storybook server:

```sh
LENSO_CHOICE_URL=http://127.0.0.1:6006 node packages/storybook/stories/choice-proof.mjs
node packages/storybook/stories/choice-rtl-proof.mjs
```

`PLAYWRIGHT_MODULE` can point at an already-installed readonly Playwright entry.
`LENSO_CHOICE_WORKSPACE` selects a scratch mirror with installed dependencies and
built UI/styles for RTL proof. `LENSO_CHOICE_SCREENSHOTS` optionally captures
light/dark desktop card screenshots.

## Visual evidence and limits

Inspected the actual production light/dark delivery/payment screenshots.
The inherited native control radius maps remain unchanged; square-looking
native radio controls in those screenshots are not proof of upstream radius
fidelity. There is **no upstream screenshot/pixel-diff claim** here.
The 100 mounts prove runnable scenario coverage, not exhaustive visual parity.
Responsive and reduced-motion checks are scoped to the card scenario;
RTL keyboard/geometry proof is scoped to Slider Default/Range. Not every story,
viewport, focus/hover state, pointer-drag path or assistive technology was
visually compared. No full docs live-example coverage claim is made.

Antislop was applied during reconstruction: pinned source design is the visual
direction, not an opportunity to invent cards, marketing copy, gradients or
motion. Cards serve the actual selection scenarios; source icon identities,
labels and deliberate custom switch color/glow remain scenario-specific.
The delivery gate was checked against that reconstruction boundary; remaining
visual verification limits are stated rather than recast as a full visual pass.
No optional React Doctor installation/whole-codebase scan was performed.

## Attribution

HeroUI-derived story/anatomy work retains **Apache-2.0** source notices and the
repository's HeroUI license. Gravity UI SVG path data is embedded offline from
Iconify or reused from the existing offline icon fixture: **MIT, YANDEX LLC**,
with `GRAVITY-ICONS-LICENSE.txt` retained. Volume paths use the equivalent root
SVG viewBox clipping instead of duplicating upstream clipPath IDs.
Payment glyphs import only the existing exact offline `payment-icons.ts` data:
Unicons Mastercard **Apache-2.0**, Streamline Visa **CC BY 4.0**, Google Material
PayPal **Apache-2.0**. No working React Aria/Tailwind demo is imported.
Preserved primitives remain outside this change.
