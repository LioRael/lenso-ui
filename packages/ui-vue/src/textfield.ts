import { inputStyles } from "@lenso/tokens/input";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import { groupStyles } from "@lenso/tokens/surface";
import { textFieldStyles } from "@lenso/tokens/textfield";
import { Field as SdkRoot } from "@ui-sdk/vue/field";
import {
  InputGroup as SdkGroup,
  InputClear as SdkClear,
  Input as SdkInput,
} from "@ui-sdk/vue/input";
import { defineComponent, h, inject, type PropType } from "vue";
import { Description as FieldDescription } from "./description.js";
import { FieldGroupContext, fieldGroupScope } from "./field-group-context.js";
import { glassControlLifecycle } from "./glass-button.js";
import { useGlassElement } from "./glass.js";
import { Label as FieldLabel } from "./label.js";
import { partAttributes, htmlPart, type StyledPart } from "./parts.js";

type Layout = "row" | "stacked";
export const TextFieldRoot = defineComponent({
  inheritAttrs: false,
  props: { layout: String as PropType<Layout>, fullWidth: Boolean },
  setup(props, { attrs, slots }) {
    const grouped = inject(FieldGroupContext, false);
    return () => {
      const layout = props.layout ?? (grouped ? "row" : "stacked");
      return h(
        SdkRoot,
        partAttributes(
          "text-field",
          [
            textFieldStyles.root,
            grouped && groupStyles.row,
            grouped && groupStyles.divided,
            grouped && groupStyles.fieldFocus,
            grouped && textFieldStyles.groupedField,
            layout === "row" && textFieldStyles.row,
            grouped && layout === "stacked" && textFieldStyles.stacked,
            props.fullWidth && textFieldStyles.fullWidth,
          ],
          { ...attrs, "data-field-layout": layout, "data-field-grouped": grouped || undefined },
        ),
        slots,
      );
    };
  },
}) as unknown as StyledPart<typeof SdkRoot, { layout?: Layout; fullWidth?: boolean }>;
export const TextFieldGroup = fieldGroupScope(
  htmlPart("fieldset", "text-field-group", () => [
    groupStyles.surface,
    groupStyles.group,
    textFieldStyles.group,
  ]),
  true,
);
type InputOptions = {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  glass?: boolean;
  elastic?: boolean;
  clearable?: boolean;
  clearLabel?: string;
};
export const TextFieldInput = defineComponent({
  inheritAttrs: false,
  props: {
    variant: String,
    fullWidth: Boolean,
    glass: Boolean,
    elastic: Boolean,
    clearable: { type: Boolean, default: true },
    clearLabel: { type: String, default: "Clear text" },
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { attrs, slots }) {
    const grouped = inject(FieldGroupContext, false);
    const element = useGlassElement(
      () => props.elastic && !props.disabled,
      () => props.glass,
    );
    const lifecycle = glassControlLifecycle(element);
    return () =>
      h(
        SdkGroup,
        {
          ...partAttributes(
            "text-field-control",
            [
              props.glass && liquidMaterialStyles.small,
              inputStyles.input,
              props.glass && inputStyles.fieldGlass,
              props.elastic && inputStyles.elastic,
              !props.glass && props.variant === "secondary" && inputStyles.secondary,
              textFieldStyles.control,
              props.fullWidth && inputStyles.fullWidth,
              grouped && !props.glass && inputStyles.formGrouped,
            ],
            {},
          ),
          ...lifecycle,
        },
        {
          default: () => [
            h(
              SdkInput,
              partAttributes(
                "text-field-input",
                [inputStyles.groupedControl, textFieldStyles.input],
                { placeholder: "", ...attrs, disabled: props.disabled },
              ),
              slots,
            ),
            props.clearable &&
              h(
                SdkClear,
                partAttributes("text-field-clear", textFieldStyles.clear, {
                  "aria-label": props.clearLabel,
                  onPointerdown: (event: PointerEvent) => event.preventDefault(),
                }),
                {
                  default: () =>
                    h(
                      "svg",
                      { viewBox: "0 0 20 20", width: 20, height: 20, "aria-hidden": "true" },
                      [
                        h("circle", { cx: 10, cy: 10, r: 8, fill: "currentColor" }),
                        h("path", {
                          d: "m7.5 7.5 5 5m0-5-5 5",
                          fill: "none",
                          stroke: "var(--lenso-background-grouped-secondary)",
                          "stroke-width": 1.5,
                          "stroke-linecap": "round",
                        }),
                      ],
                    ),
                },
              ),
          ],
        },
      );
  },
}) as unknown as StyledPart<typeof SdkInput, InputOptions>;
export const TextField: typeof TextFieldRoot & {
  Label: typeof FieldLabel;
  Description: typeof FieldDescription;
  Root: typeof TextFieldRoot;
  Group: typeof TextFieldGroup;
  Input: typeof TextFieldInput;
} = Object.assign(TextFieldRoot, {
  Label: FieldLabel,
  Description: FieldDescription,
  Root: TextFieldRoot,
  Group: TextFieldGroup,
  Input: TextFieldInput,
});
