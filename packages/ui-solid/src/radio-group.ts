import { radioGroupStyles } from "@lenso/tokens/radio-group";
import { RadioGroup as SdkGroup } from "@ui-sdk/solid/radio";
import type { ComponentProps } from "solid-js";
import { sdkPart } from "./parts.js";
import type { StyleXProps } from "./styled.js";

const Root = sdkPart(SdkGroup, "radio-group", () => radioGroupStyles.root);
export function RadioGroupRoot<T extends string = string>(
  props: ComponentProps<typeof SdkGroup<T>> & StyleXProps,
) {
  return Root(props as ComponentProps<typeof Root>);
}
export const RadioGroup: typeof RadioGroupRoot & {
  Root: typeof RadioGroupRoot;
} = Object.assign(RadioGroupRoot, {
  Root: RadioGroupRoot,
});
