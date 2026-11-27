import AccordionRoot from "./accordion-root.svelte";
import AccordionItem from "./accordion-item.svelte";
import AccordionHeading from "./accordion-heading.svelte";
import AccordionTrigger from "./accordion-trigger.svelte";
import AccordionPanel from "./accordion-panel.svelte";
import AccordionBody from "./accordion-body.svelte";
import AccordionIndicator from "./accordion-indicator.svelte";

export {
  AccordionRoot,
  AccordionItem,
  AccordionHeading,
  AccordionTrigger,
  AccordionPanel,
  AccordionBody,
  AccordionIndicator,
};
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
