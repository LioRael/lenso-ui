import { tabsStyles } from "@lenso/tokens/tabs";
import { segmentedControlStyles } from "@lenso/tokens/segmented-control";
import {
  SegmentedControl as SdkRoot,
  SegmentedControlItem as SdkItem,
  SegmentedControlIndicator as SdkIndicator,
} from "@ui-sdk/vue/segmented-control";
import { sdkPart, type StyledPart } from "./parts.js";

export const SegmentedControlRoot: StyledPart<typeof SdkRoot> = sdkPart(
  SdkRoot,
  "segmented-control",
  () => segmentedControlStyles.root,
);
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
