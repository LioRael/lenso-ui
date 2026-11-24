import { checkboxGroupStyles } from "@lenso/tokens/checkbox-group";
import { CheckboxGroup as SdkGroup } from "@ui-sdk/solid/checkbox";
import type { ComponentProps } from "solid-js";
import { sdkPart } from "./parts.js";
import type { StyleXProps } from "./styled.js";

const Root = sdkPart(SdkGroup, "checkbox-group", () => checkboxGroupStyles.root);
export function CheckboxGroupRoot<T extends string = string>(
  props: ComponentProps<typeof SdkGroup<T>> & StyleXProps,
) {
  return Root(props as ComponentProps<typeof Root>);
}
export const CheckboxGroup: typeof CheckboxGroupRoot & {
  Root: typeof CheckboxGroupRoot;
} = Object.assign(CheckboxGroupRoot, {
  Root: CheckboxGroupRoot,
});
