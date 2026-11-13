# @lenso/ui

Components use StyleX and native UI SDK interaction contracts. Forms, selection,
floating overlays and notifications import SDK parts directly. Date, time and
color families retain their domain value models. Product-specific collection
and gesture behavior remains in its owning components.

Use `Content` for floating surfaces, native controllers for imperative actions,
and `createToaster` with `Toast.Region` for notifications. Autocomplete edits
free text; ComboBox selects options and supports multiple values. Former Base UI
Portal/Positioner/Popup compositions and manager APIs are removed.

Controls expose the SDK agent registry through `createAgent`, `agentTools` and
`registerTools` from `@lenso/ui/agent`. Custom product behavior is not implicitly
covered by the SDK registry. See [migration notes](../../docs/plans/ui-sdk-react-migration.md)
for breaking contracts and the unpatched upstream strict declaration issue.

Import themes and component styles once:

```tsx
import "@lenso/tokens/styles.css";
import { Button } from "@lenso/ui";

<Button variant="primary" size="md">
  Save
</Button>;
```

Components retain native props such as `disabled`, `onClick` and `render`.
Date/time/color parts compose native fields, inputs, number fields, sliders,
radio groups, buttons and popovers. `xstyle` is a typed
StyleX override; native runtime styles and state-dependent style callbacks
remain available.

Components use shared materials and motion. Use `data-lenso-backdrop` to mark a
bounded background for refraction. Switches retain native semantics, drag and
keyboard interaction. Consumers using StyleX maps directly can compose
`buttonStyles.glass` and `buttonStyles.material`; React components apply their
own styles.

Package artifacts include `THIRD_PARTY_NOTICES.md`, including the original
Apache and MIT license texts for retained adaptations.

## Toolbar button defaults

`Toolbar.Group` provides a shared surface, so its buttons default to `plain`.
Buttons outside a group continue to default to `glass`. An explicit `variant`
always wins, including `glass` or `filled` inside a group:

```tsx
<Toolbar aria-label="Page actions">
  <Toolbar.Group>
    <Toolbar.Button>Previous</Toolbar.Button>
    <Toolbar.Button>Next</Toolbar.Button>
    <Toolbar.Button variant="filled">Publish</Toolbar.Button>
  </Toolbar.Group>
</Toolbar>
```

## Shared glass runtime

Glass optics and common motion now come from `@lenso/glass`. Existing component
imports are unchanged; migrated controls use UI SDK interaction contracts and
`@lenso/tokens` retains material recipes. See
[`packages/glass/README.md`](../glass/README.md) for direct runtime use and browser
limits. Local tarball consumers must include the new package; it is not yet
published and requires a separately authorized release.
