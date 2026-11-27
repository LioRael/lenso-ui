import { checkboxGroupStyles } from "@lenso/tokens/checkbox-group";
import { CheckboxGroup as SdkGroup } from "@ui-sdk/solid/checkbox";
import { CheckboxVariantContext, type CheckboxVariant } from "./checkbox.jsx";
import { createComponent, omit, type ComponentProps } from "solid-js";
import { sdkPart } from "./parts.js";
import type { StyleXProps } from "./styled.js";

const Root = sdkPart(SdkGroup, "checkbox-group", () => checkboxGroupStyles.root);
export function CheckboxGroupRoot<T extends string = string>(
  props: ComponentProps<typeof SdkGroup<T>> & StyleXProps & { variant?: CheckboxVariant },
) {
  return createComponent(CheckboxVariantContext, {
    value: () => props.variant ?? "primary",
    get children() {
      return createComponent(Root, omit(props, "variant") as ComponentProps<typeof Root>);
    },
  });
}
export const CheckboxGroup: typeof CheckboxGroupRoot & {
  Root: typeof CheckboxGroupRoot;
} = Object.assign(CheckboxGroupRoot, {
  Root: CheckboxGroupRoot,
});
