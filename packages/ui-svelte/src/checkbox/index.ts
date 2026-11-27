import type { ComponentProps } from "svelte";
import CheckboxRoot from "./checkbox-root.svelte";
import CheckboxContent from "./checkbox-content.svelte";
import CheckboxControl from "./checkbox-control.svelte";
import CheckboxIndicator from "./checkbox-indicator.svelte";

export type { CheckboxProps } from "./checkbox-root.svelte";
export type CheckboxContentProps = ComponentProps<typeof CheckboxContent>;
export type CheckboxControlProps = ComponentProps<typeof CheckboxControl>;
export type CheckboxIndicatorProps = ComponentProps<typeof CheckboxIndicator>;

export const Checkbox: typeof CheckboxRoot & {
  Root: typeof CheckboxRoot;
  Content: typeof CheckboxContent;
  Control: typeof CheckboxControl;
  Indicator: typeof CheckboxIndicator;
} = Object.assign(CheckboxRoot, {
  Root: CheckboxRoot,
  Content: CheckboxContent,
  Control: CheckboxControl,
  Indicator: CheckboxIndicator,
});

export { CheckboxContent };

export { CheckboxControl };

export { CheckboxIndicator };

export { CheckboxRoot };

export { CheckboxVariantContext, type CheckboxVariant } from "./variant.js";
