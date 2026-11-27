/**
 * Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: Vue composition with UI SDK state and Lenso StyleX.
 */
import { checkboxStyles } from "@lenso/tokens/checkbox";
import { Checkbox as SdkRoot, CheckboxIndicator as SdkIndicator } from "@ui-sdk/vue/checkbox";
import * as stylex from "@stylexjs/stylex";
import { defineComponent, h } from "vue";
import { checkboxGroupStyles } from "@lenso/tokens/checkbox-group";
import { CheckboxGroup as SdkGroup } from "@ui-sdk/vue/checkbox";
import { createChoiceVariant, type ChoiceVariant } from "./choice-variant.js";
import {
  htmlPart,
  partAttributes,
  sdkPart,
  type ComponentProps,
  type StyledPart,
} from "./parts.js";

type Variant = { variant?: ChoiceVariant };
export const CheckboxVariantContext: import("vue").InjectionKey<() => ChoiceVariant> =
  Symbol("CheckboxVariant");
const withVariant = createChoiceVariant(CheckboxVariantContext);
const Root: StyledPart<typeof SdkRoot> = sdkPart(SdkRoot, "checkbox", () => checkboxStyles.root);
export const CheckboxContent = htmlPart("span", "checkbox-content", () => checkboxStyles.content);
const Control = htmlPart<"span", Variant>(
  "span",
  "checkbox-control",
  (props) => [checkboxStyles.control, props.variant === "secondary" && checkboxStyles.secondary],
  "variant",
);
export const CheckboxRoot: StyledPart<typeof SdkRoot, Variant> = withVariant(
  Root,
  true,
) as unknown as StyledPart<typeof SdkRoot, Variant>;
export const CheckboxControl: typeof Control = withVariant(
  Control,
  false,
) as unknown as typeof Control;
const Group: StyledPart<typeof SdkGroup> = sdkPart(
  SdkGroup,
  "checkbox-group",
  () => checkboxGroupStyles.root,
);
export const CheckboxGroupRoot: StyledPart<typeof SdkGroup, Variant> = withVariant(
  Group,
  true,
) as unknown as StyledPart<typeof SdkGroup, Variant>;
export const CheckboxIndicator: StyledPart<typeof SdkIndicator> = defineComponent({
  name: "LensoCheckboxIndicator",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        SdkIndicator,
        partAttributes("checkbox-indicator", checkboxStyles.indicator, {
          "aria-hidden": "true",
          keepMounted: true,
          ...attrs,
        }),
        {
          ...slots,
          default:
            slots["default"] ??
            (() => [
              h(
                "svg",
                {
                  ...stylex.attrs(checkboxStyles.checkmark),
                  viewBox: "0 0 17 18",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-dasharray": "22",
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                },
                [h("polyline", { points: "1 9 7 14 15 4" })],
              ),
              h(
                "svg",
                {
                  ...stylex.attrs(checkboxStyles.indeterminate),
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-linecap": "round",
                },
                [h("path", { d: "M5 12h14" })],
              ),
            ]),
        },
      );
  },
}) as unknown as StyledPart<typeof SdkIndicator>;
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

export type CheckboxVariant = ChoiceVariant;
export type CheckboxProps = ComponentProps<typeof CheckboxRoot>;
export type CheckboxContentProps = ComponentProps<typeof CheckboxContent>;
export type CheckboxControlProps = ComponentProps<typeof CheckboxControl>;
export type CheckboxIndicatorProps = ComponentProps<typeof CheckboxIndicator>;
