<script lang="ts">
  import { CheckboxVariantContext, type CheckboxVariant } from "../checkbox/variant.js";
  import { checkboxGroupStyles } from "@lenso/tokens/checkbox-group";
  import type { ComponentProps } from "svelte";
  import { CheckboxGroup as Part } from "@ui-sdk/svelte/checkbox";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps & { variant?: CheckboxVariant };
  let { variant, value = $bindable(), xstyle, class: className, style, ...rest }: Props = $props();
  CheckboxVariantContext.set(() => variant ?? "primary");
  const presentation = $derived(styled(checkboxGroupStyles.root, xstyle, className, style));
</script>

<Part data-lenso-slot="checkbox-group" {...rest} {...presentation} bind:value />
