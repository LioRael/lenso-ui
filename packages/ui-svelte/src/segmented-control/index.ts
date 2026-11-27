import SegmentedControlRoot from "./segmented-control-root.svelte";
import SegmentedControlItem from "./segmented-control-item.svelte";
import SegmentedControlIndicator from "./segmented-control-indicator.svelte";

export { SegmentedControlRoot, SegmentedControlItem, SegmentedControlIndicator };
export const SegmentedControl: typeof SegmentedControlRoot & {
  Root: typeof SegmentedControlRoot;
  Item: typeof SegmentedControlItem;
  Indicator: typeof SegmentedControlIndicator;
} = Object.assign(SegmentedControlRoot, {
  Root: SegmentedControlRoot,
  Item: SegmentedControlItem,
  Indicator: SegmentedControlIndicator,
});
