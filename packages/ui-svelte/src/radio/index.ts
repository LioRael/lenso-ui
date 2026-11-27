import RadioRoot from "./radio-root.svelte";
import RadioContent from "./radio-content.svelte";
import RadioControl from "./radio-control.svelte";
import RadioIndicator from "./radio-indicator.svelte";

export { RadioRoot, RadioContent, RadioControl, RadioIndicator };
export const Radio: typeof RadioRoot & {
  Root: typeof RadioRoot;
  Content: typeof RadioContent;
  Control: typeof RadioControl;
  Indicator: typeof RadioIndicator;
} = Object.assign(RadioRoot, {
  Root: RadioRoot,
  Content: RadioContent,
  Control: RadioControl,
  Indicator: RadioIndicator,
});

export { RadioVariantContext, type RadioVariant } from "./variant.js";
