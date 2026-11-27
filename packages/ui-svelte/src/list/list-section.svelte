<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { setSection } from "./context.js";
  import Section from "./section.svelte";
  import SectionHeading from "./section-heading.svelte";

  type Props = ComponentProps<typeof Section>;
  let { title, children, ...rest }: Props = $props();
  setSection(() => rest.id || title || undefined);
</script>

<Section {...rest}>
  {#if title}<SectionHeading>{title}</SectionHeading>{/if}
  <ul>{@render children?.()}</ul>
</Section>
