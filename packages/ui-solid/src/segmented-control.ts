import { tabsStyles } from "@lenso/tokens/tabs";
import { segmentedControlStyles } from "@lenso/tokens/segmented-control";
import {
  SegmentedControl as SdkRoot,
  SegmentedControlItem as SdkItem,
  SegmentedControlIndicator as SdkIndicator,
} from "@ui-sdk/solid/segmented-control";
import { sdkPart, type SlotProps, type StyledPart } from "./parts.js";

export function SegmentedControlRoot<T extends string = string>(
  props: Parameters<typeof SdkRoot<T>>[0] & SlotProps,
) {
  return sdkPart(SdkRoot<T>, "segmented-control", () => segmentedControlStyles.root)(props);
}
export const SegmentedControlItem: StyledPart<typeof SdkItem> = sdkPart(
  SdkItem,
  "segmented-control-item",
  () => segmentedControlStyles.item,
);
export const SegmentedControlIndicator: StyledPart<typeof SdkIndicator> = sdkPart(
  SdkIndicator,
  "segmented-control-indicator",
  () => tabsStyles.indicator,
);

export const SegmentedControl: typeof SegmentedControlRoot & {
  Root: typeof SegmentedControlRoot;
  Item: typeof SegmentedControlItem;
  Indicator: typeof SegmentedControlIndicator;
} = Object.assign(SegmentedControlRoot, {
  Root: SegmentedControlRoot,
  Item: SegmentedControlItem,
  Indicator: SegmentedControlIndicator,
});
