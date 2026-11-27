<script lang="ts">
  import { fieldsetStyles } from "@lenso/tokens/fieldset";
  import { groupStyles } from "@lenso/tokens/surface";
  import type { ComponentProps } from "svelte";
  import { FieldGroup as Part } from "@ui-sdk/svelte/field";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [groupStyles.surface, groupStyles.group, fieldsetStyles.group],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="fieldset-group" {...rest} {...presentation} />
