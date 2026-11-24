import { accordionStyles } from "@lenso/tokens/accordion";
import {
  Accordion as SdkRoot,
  AccordionItem as SdkItem,
  AccordionHeader as SdkHeading,
  AccordionTrigger as SdkTrigger,
  AccordionPanel as SdkPanel,
} from "@ui-sdk/solid/accordion";
import { htmlPart, sdkPart, type SlotProps, type StyledPart } from "./parts.js";

export function AccordionRoot<T extends string = string>(
  props: Parameters<typeof SdkRoot<T>>[0] & SlotProps,
) {
  return sdkPart(SdkRoot<T>, "accordion", () => accordionStyles.root)(props);
}
export const AccordionItem: StyledPart<typeof SdkItem> = sdkPart(
  SdkItem,
  "accordion-item",
  () => accordionStyles.item,
);
export const AccordionHeading: StyledPart<typeof SdkHeading> = sdkPart(
  SdkHeading,
  "accordion-heading",
  () => accordionStyles.heading,
);
export const AccordionTrigger: StyledPart<typeof SdkTrigger> = sdkPart(
  SdkTrigger,
  "accordion-trigger",
  () => accordionStyles.trigger,
);
export const AccordionPanel: StyledPart<typeof SdkPanel> = sdkPart(
  SdkPanel,
  "accordion-panel",
  () => accordionStyles.panel,
);
export const AccordionBody = htmlPart("div", "accordion-body", () => accordionStyles.body);
export const AccordionIndicator = htmlPart(
  "span",
  "accordion-indicator",
  () => accordionStyles.indicator,
);

export const Accordion: typeof AccordionRoot & {
  Root: typeof AccordionRoot;
  Item: typeof AccordionItem;
  Heading: typeof AccordionHeading;
  Trigger: typeof AccordionTrigger;
  Panel: typeof AccordionPanel;
  Body: typeof AccordionBody;
  Indicator: typeof AccordionIndicator;
} = Object.assign(AccordionRoot, {
  Root: AccordionRoot,
  Item: AccordionItem,
  Heading: AccordionHeading,
  Trigger: AccordionTrigger,
  Panel: AccordionPanel,
  Body: AccordionBody,
  Indicator: AccordionIndicator,
});
