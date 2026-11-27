<script lang="ts">
  import { listBoxItemStyles } from "@lenso/tokens/list-box";
  import type { ComponentProps } from "svelte";
  import { ListboxItem as Part } from "@ui-sdk/svelte/listbox";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps & { variant?: "default" | "danger" };
  let { variant, xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [
        listBoxItemStyles.root,
        rest.disabled && listBoxItemStyles.disabled,
        variant === "danger" && listBoxItemStyles.danger,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="list-box-item" {...rest} {...presentation} />
