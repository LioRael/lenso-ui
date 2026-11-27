import { radioGroupStyles } from "@lenso/tokens/radio-group";
import { RadioGroup as SdkGroup } from "@ui-sdk/solid/radio";
import { RadioVariantContext, type RadioVariant } from "./radio.js";
import { createComponent, omit, type ComponentProps } from "solid-js";
import { sdkPart } from "./parts.js";
import type { StyleXProps } from "./styled.js";

const Root = sdkPart(SdkGroup, "radio-group", () => radioGroupStyles.root);
export function RadioGroupRoot<T extends string = string>(
  props: ComponentProps<typeof SdkGroup<T>> & StyleXProps & { variant?: RadioVariant },
) {
  return createComponent(RadioVariantContext, {
    value: () => props.variant ?? "primary",
    get children() {
      return createComponent(Root, omit(props, "variant") as ComponentProps<typeof Root>);
    },
  });
}
export const RadioGroup: typeof RadioGroupRoot & {
  Root: typeof RadioGroupRoot;
} = Object.assign(RadioGroupRoot, {
  Root: RadioGroupRoot,
});
