<script lang="ts">
  import { createSpring, type Spring } from "@lenso/glass/motion";
  import { toastStyles as s } from "@lenso/tokens/toast";
  import { untrack } from "svelte";
  import { attributes } from "../styled.js";

  let { value, place }: { value: number; place: 100 | 10 | 1 } = $props();
  let previous = untrack(() => value);
  const digit = (number: number) => Math.floor(number / place) % 10;
  let rows = $state.raw(untrack(() => [{ at: 0, digit: digit(value) }]));
  let target = $state(0);
  let position = $state(0);
  let presence = $state(untrack(() => (place === 1 || value >= place ? 1 : 0)));
  let roll: Spring | undefined;
  let width: Spring | undefined;

  $effect(() => {
    roll = createSpring(0, 900, 48, (next) => {
      position = next;
      if (Math.abs(next - target) < 0.0001 && rows.length > 1)
        rows = rows.filter(({ at }) => at === target);
    });
    width = createSpring(
      untrack(() => presence),
      900,
      48,
      (next) => {
        presence = Math.max(0, Math.min(1, next));
      },
    );
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const settle = () => {
      if (reduced.matches) {
        roll?.set(target, true);
        width?.set(place === 1 || value >= place ? 1 : 0, true);
      }
    };
    reduced.addEventListener("change", settle);
    return () => {
      roll?.stop();
      width?.stop();
      reduced.removeEventListener("change", settle);
    };
  });

  $effect(() => {
    const next = value;
    untrack(() => {
      if (digit(next) !== digit(previous)) {
        target += next > previous ? 1 : -1;
        rows = [...rows.filter(({ at }) => at !== target), { at: target, digit: digit(next) }];
        roll?.set(target);
      }
      width?.set(place === 1 || next >= place ? 1 : 0);
      previous = next;
    });
  });
</script>

<span {...attributes(s.digit)} style:--toast-digit-presence={presence}>
  {#each rows as row (row.at)}
    {@const distance = row.at - position}
    <span
      data-row={row.at}
      {...attributes(s.digitRow)}
      style:transform={`translateY(${distance * 100}%)`}
      style:opacity={Math.max(0, 1 - Math.abs(distance))}
      style:filter={`blur(${Math.min(2, Math.abs(distance) * 1.5)}px)`}
    >
      {row.digit}
    </span>
  {/each}
</span>
