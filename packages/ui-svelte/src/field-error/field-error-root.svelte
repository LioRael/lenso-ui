<script lang="ts">
  import { fieldErrorStyles } from "@lenso/tokens/field-error";
  import { textFieldStyles } from "@lenso/tokens/textfield";
  import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
  import type { ComponentProps } from "svelte";
  import { FieldError as Part } from "@ui-sdk/svelte/field";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [fieldErrorStyles.error, textFieldStyles.supporting, checkboxSupportingStyles.error],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="field-error" {...rest} {...presentation} />
