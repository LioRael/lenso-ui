<script lang="ts">
  import { prefersReducedMotion } from "@lenso/glass/motion";
  import { toastStyles as s } from "@lenso/tokens/toast";
  import type { Snippet } from "svelte";
  import { attributes } from "../styled.js";

  let { identity, clip, children }: { identity: unknown; clip?: boolean; children: Snippet } =
    $props();
  let live: HTMLSpanElement | undefined = $state();
  let layer: HTMLSpanElement | undefined = $state();
  let snapshot: HTMLElement | undefined;
  let previous: unknown;

  $effect(() => {
    const key = identity;
    if (!live || !layer) return;
    const current = live;
    const outgoing = previous === key ? undefined : snapshot;
    previous = key;
    snapshot = current.cloneNode(true) as HTMLElement;
    snapshot.removeAttribute("class");
    for (const node of snapshot.querySelectorAll("[id]")) node.removeAttribute("id");
    if (!outgoing || prefersReducedMotion()) return;

    layer.append(outgoing);
    const options = { duration: 280, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" as const };
    const incoming = current.animate(
      [
        { opacity: 0, transform: "translateY(6px)", filter: "blur(3px)" },
        { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
      ],
      options,
    );
    const leaving = outgoing.animate(
      [
        { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
        { opacity: 0, transform: "translateY(-6px)", filter: "blur(3px)" },
      ],
      options,
    );
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    function finish() {
      outgoing?.remove();
      incoming.cancel();
      leaving.cancel();
      reduced.removeEventListener("change", settle);
    }
    function settle() {
      if (reduced.matches) finish();
    }
    incoming.onfinish = finish;
    reduced.addEventListener("change", settle);
    return finish;
  });
</script>

<span {...attributes(s.swap, clip && s.pillTitleText)}>
  <span aria-hidden="true" inert {...attributes(s.swapPrevious)} bind:this={layer}></span>
  <span {...attributes(s.swapCurrent)} bind:this={live}>{@render children()}</span>
</span>
