import AlertRoot from "./alert-root.svelte";
import AlertIndicator from "./alert-indicator.svelte";
import AlertTitle from "./alert-title.svelte";
import AlertDescription from "./alert-description.svelte";
import AlertContent from "./alert-content.svelte";

export { AlertRoot, AlertIndicator, AlertTitle, AlertDescription, AlertContent };
export const Alert: typeof AlertRoot & {
  Root: typeof AlertRoot;
  Indicator: typeof AlertIndicator;
  Title: typeof AlertTitle;
  Description: typeof AlertDescription;
  Content: typeof AlertContent;
} = Object.assign(AlertRoot, {
  Root: AlertRoot,
  Indicator: AlertIndicator,
  Title: AlertTitle,
  Description: AlertDescription,
  Content: AlertContent,
});
