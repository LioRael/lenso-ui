<script lang="ts">
  import { tabsStyles } from "@lenso/tokens/tabs";
  import type { ComponentProps } from "svelte";
  import { TabsList as Part } from "@ui-sdk/svelte/tabs";
  import { styled, type StyleXProps } from "../styled.js";

  import { getTabsOrientation } from "./context.js";

  type Props = ComponentProps<typeof Part> & StyleXProps & { size?: "md" | "lg" };
  let { size, xstyle, class: className, style, ...rest }: Props = $props();
  const orientation = getTabsOrientation();
  const presentation = $derived(
    styled(
      [
        tabsStyles.list,
        orientation?.() === "vertical" ? tabsStyles.listVertical : tabsStyles.listHorizontal,
        size === "lg" && tabsStyles.large,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="tabs-list" {...rest} {...presentation} />
