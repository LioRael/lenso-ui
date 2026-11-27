<script lang="ts" generics="T = string, Multiple extends boolean | undefined = false">
  import { Combobox as SdkRoot } from "@ui-sdk/svelte/combobox";
  import type { ComponentProps } from "svelte";

  type Props<T, Multiple extends boolean | undefined> = ComponentProps<typeof SdkRoot<T, Multiple>>;
  let {
    value = $bindable(),
    open = $bindable(),
    query = $bindable(),
    ...rest
  }: Props<T, Multiple> = $props();
  const Root = SdkRoot<T, Multiple>;
</script>

<Root {...rest as Props<T, Multiple>} bind:value bind:open bind:query />
