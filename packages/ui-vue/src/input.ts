import { inputStyles } from "@lenso/tokens/input";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import { Input as SdkRoot } from "@ui-sdk/vue/input";
import { defineComponent, h, inject, type PropType } from "vue";
import { FieldGroupContext } from "./field-group-context.js";
import { glassControlLifecycle } from "./glass-button.js";
import { useGlassElement } from "./glass.js";
import { partAttributes, type StyledPart } from "./parts.js";

type Appearance = {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  glass?: boolean;
  elastic?: boolean;
};
const InputRootComponent = defineComponent({
  inheritAttrs: false,
  props: {
    variant: String as PropType<Appearance["variant"]>,
    fullWidth: Boolean,
    glass: Boolean,
    elastic: Boolean,
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
        SdkRoot,
        {
          ...partAttributes(
            "input",
            [
              props.glass && liquidMaterialStyles.small,
              inputStyles.input,
              props.glass && inputStyles.fieldGlass,
              props.elastic && inputStyles.elastic,
              !props.glass && props.variant === "secondary" && inputStyles.secondary,
              props.fullWidth && inputStyles.fullWidth,
              grouped && !props.glass && inputStyles.formGrouped,
            ],
            attrs,
          ),
          ...lifecycle,
          disabled: props.disabled,
        },
        slots,
      );
  },
});
export const InputRoot = InputRootComponent as unknown as StyledPart<typeof SdkRoot, Appearance>;
export const Input: typeof InputRoot & {
  Root: typeof InputRoot;
} = Object.assign(InputRoot, {
  Root: InputRoot,
});
