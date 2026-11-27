<script lang="ts">
  import { separatorStyles, separatorVariants } from "@lenso/tokens/separator";
  import type { ComponentProps } from "svelte";
  import { Separator as Part } from "@ui-sdk/svelte/separator";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> &
    StyleXProps & { variant?: keyof typeof separatorVariants };
  let { variant, xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [
        separatorStyles.root,
        separatorStyles[rest.orientation ?? "horizontal"],
        separatorVariants[variant ?? "default"],
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="separator" {...rest} {...presentation} />
