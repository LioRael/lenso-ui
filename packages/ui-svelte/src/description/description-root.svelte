<script lang="ts">
  import { descriptionStyles } from "@lenso/tokens/description";
  import { textFieldStyles } from "@lenso/tokens/textfield";
  import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
  import type { ComponentProps } from "svelte";
  import { FieldDescription as Part } from "@ui-sdk/svelte/field";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [descriptionStyles.description, textFieldStyles.supporting, checkboxSupportingStyles.direct],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="description" {...rest} {...presentation} />
