import DisclosureRoot from "./disclosure-root.svelte";
import DisclosureHeading from "./disclosure-heading.svelte";
import DisclosureTrigger from "./disclosure-trigger.svelte";
import DisclosureContent from "./disclosure-content.svelte";
import DisclosureBody from "./disclosure-body.svelte";
import DisclosureIndicator from "./disclosure-indicator.svelte";

export {
  DisclosureRoot,
  DisclosureHeading,
  DisclosureTrigger,
  DisclosureContent,
  DisclosureBody,
  DisclosureIndicator,
};
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
