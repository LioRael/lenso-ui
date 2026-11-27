<!-- Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0.
     Modified for Svelte composition with UI SDK state and Lenso StyleX. -->
<script module lang="ts">
  export type CheckboxProps = ComponentProps<typeof SdkCheckbox> &
    StyleXProps & { variant?: CheckboxVariant };
</script>

<script lang="ts">
  import { CheckboxVariantContext, type CheckboxVariant } from "../checkbox/variant.js";
  import { checkboxStyles } from "@lenso/tokens/checkbox";
  import { Checkbox as SdkCheckbox } from "@ui-sdk/svelte/checkbox";
  import type { ComponentProps } from "svelte";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    variant,
    checked = $bindable(),
    xstyle,
    class: className,
    style,
    ...rest
  }: CheckboxProps = $props();
  const inherited = CheckboxVariantContext.get();
  CheckboxVariantContext.set(() => variant ?? inherited?.() ?? "primary");
  const presentation = $derived(styled(checkboxStyles.root, xstyle, className, style));
</script>

<SdkCheckbox data-lenso-slot="checkbox" {...rest} {...presentation} bind:checked />
