import ChipRoot from "./chip-root.svelte";
import ChipLabel from "./chip-label.svelte";

export { ChipRoot, ChipLabel };
export const Chip: typeof ChipRoot & {
  Root: typeof ChipRoot;
  Label: typeof ChipLabel;
} = Object.assign(ChipRoot, {
  Root: ChipRoot,
  Label: ChipLabel,
});
