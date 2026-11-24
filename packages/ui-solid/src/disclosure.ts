import { disclosureStyles } from "@lenso/tokens/disclosure";
import {
  Collapsible as SdkRoot,
  CollapsibleTrigger as SdkTrigger,
  CollapsiblePanel as SdkContent,
} from "@ui-sdk/solid/collapsible";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const DisclosureRoot: StyledPart<typeof SdkRoot> = sdkPart(
  SdkRoot,
  "disclosure",
  () => disclosureStyles.root,
);
export const DisclosureHeading = htmlPart(
  "h3",
  "disclosure-heading",
  () => disclosureStyles.heading,
);
export const DisclosureTrigger: StyledPart<typeof SdkTrigger> = sdkPart(
  SdkTrigger,
  "disclosure-trigger",
  () => disclosureStyles.trigger,
);
export const DisclosureContent: StyledPart<typeof SdkContent> = sdkPart(
  SdkContent,
  "disclosure-content",
  () => disclosureStyles.content,
);
export const DisclosureBody = htmlPart("div", "disclosure-body", () => disclosureStyles.body);
export const DisclosureIndicator = htmlPart(
  "span",
  "disclosure-indicator",
  () => disclosureStyles.indicator,
);

export const Disclosure: typeof DisclosureRoot & {
  Root: typeof DisclosureRoot;
  Heading: typeof DisclosureHeading;
  Trigger: typeof DisclosureTrigger;
  Content: typeof DisclosureContent;
  Body: typeof DisclosureBody;
  Indicator: typeof DisclosureIndicator;
} = Object.assign(DisclosureRoot, {
  Root: DisclosureRoot,
  Heading: DisclosureHeading,
  Trigger: DisclosureTrigger,
  Content: DisclosureContent,
  Body: DisclosureBody,
  Indicator: DisclosureIndicator,
});
