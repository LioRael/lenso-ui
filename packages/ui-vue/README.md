# Lenso UI for Vue

`@lenso/ui-vue` is a private preview for Vue 3.5 and newer. Build it from the
workspace or install a local tarball alongside the matching Lenso dependencies.

The package shares the Lenso StyleX tokens and uses UI SDK’s Vue components for
interaction. Import a family from the root or from its own entry. Families
expose their named parts and compound accessors.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@lenso/ui-vue/button";
import { Input } from "@lenso/ui-vue/input";

const name = ref("");
</script>

<template>
  <Input v-model="name" aria-label="Name" />
  <Button variant="prominent" :disabled="!name">Continue</Button>
</template>
```

## StyleX and Vite

Process the adapter and `@lenso/tokens` with `@stylexjs/unplugin`. The
[consumer fixture](test/fixture/vite.config.ts) includes the Vue plugin and
SSR configuration. Import the theme and emit the generated rules in your
application stylesheet.

```css
@import "@lenso/tokens/styles.css";
@stylex;
```

Use `xstyle` to apply additional StyleX styles. Styled parts forward Vue
attributes, listeners and scoped slots. Use the SDK’s `v-model` bindings,
change details and `#render` slots where the underlying part supports them.
Use `createAgent` from `@lenso/ui-vue/agent` on the client.

## Preview coverage

See [package exports](package.json) for available entries. Calendar, DatePicker,
and their range variants use the SDK’s ISO values and date controls. Glass and
ButtonGroup use the shared optics, press, and fusion runtime.

The package covers all React component entries and compound part names. Vue
components follow native SDK value models and scoped slot conventions. Table
supports windowing, tree rows, selection, column sizing and drag and drop.
TabBar uses the shared indicator, drag and minimization motion. CalendarYearPicker
and TagGroup share the keyboard and focus behavior used by the other adapters.

`Breadcrumbs` renders a navigation landmark and marks the last item as the current
page. Use `Fieldset.Group` to share a form surface between `TextField` and
`Accordion`. `TextField.Input` includes a clear button by default. Set
`clear-label` to localize it or `:clearable="false"` to omit it.

`Modal` accepts `scroll="outside"` on the root. `AlertDialog.Content` accepts
`size` and `placement`. For a floating sheet that attaches at full height, pass
`:edge-attached-snap-points="[1]"` to `Sheet`. `AvatarGroup` supports `max`,
`overlap="clip"` or `"ring"`, and an explicit `AvatarGroup.Count` slot child.

The packed consumer fixture verifies Vue template types, production SSR and
hydration, styles, `v-model`, scoped slots, focus restoration, keyboard
navigation and agent updates in Chromium and WebKit.
