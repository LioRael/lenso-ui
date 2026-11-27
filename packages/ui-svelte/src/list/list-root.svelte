<script module lang="ts">
  export type ListRootProps = PartProps<"ul", StateOf<typeof list, "root">> &
    StyleXProps &
    ListOptions & { variant?: "grouped" | "plain" };
</script>

<script lang="ts">
  import { list, type ListOptions } from "@lenso/primitives/list/core";
  import { listStyles as s } from "@lenso/tokens/list";
  import { groupStyles } from "@lenso/tokens/surface";
  import type { StateOf } from "@ui-sdk/core";
  import { Part, usePart, usePrimitive, type PartProps } from "@ui-sdk/svelte/primitive";
  import { styled, type StyleXProps } from "../styled.js";
  import { setList } from "./context.js";

  let {
    editing,
    disabled,
    value,
    defaultValue,
    onValueChange,
    onReorder,
    controller,
    variant,
    xstyle,
    class: className,
    style,
    ...rest
  }: ListRootProps = $props();
  const id = $props.id();
  const handle = usePrimitive(list, () => ({
    id,
    editing,
    disabled,
    value,
    defaultValue,
    onValueChange,
    onReorder,
    controller,
  }));
  const root = usePart(handle, "root");
  let currentState = $state.raw(handle.instance.get());
  setList({ handle, state: () => currentState });
  $effect(() => {
    const update = () => {
      currentState = handle.instance.get();
    };
    update();
    return handle.instance.subscribe(update);
  });
  const presentation = $derived(
    styled(
      [variant !== "plain" && groupStyles.surface, s.root, variant !== "plain" && s.surface],
      xstyle,
      className,
      style,
    ),
  );
</script>

{#if root.present}
  <Part
    tag="ul"
    part={root}
    props={{ "aria-label": "List", "data-lenso-slot": "list-root", ...rest, ...presentation }}
  />
{/if}
