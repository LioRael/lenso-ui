<script module lang="ts">
  export type Props = ComponentProps<typeof Button> & Record<never, never>;
</script>

<script lang="ts">
  import { Button } from "../button/index.js";
  import type { ComponentProps } from "svelte";
  import { getController } from "./context.js";
  let { onclick, ...rest }: Props = $props();
  const controller = getController();
</script>

<Button
  aria-label="Close"
  {...rest}
  onclick={(e, d) => {
    const result = onclick?.(e, d);
    if (!e.defaultPrevented) controller?.().setOpen(false, { reason: "close-press", event: e });
    return result;
  }}
/>
