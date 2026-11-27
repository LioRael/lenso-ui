import { buttonGroupStyles } from "@lenso/tokens/button-group";
import { glassContainerStyles } from "@lenso/tokens/glass-container";
import { useGlassFusion } from "./glass-container.js";
import {
  defineComponent,
  h,
  inject,
  provide,
  type FieldsetHTMLAttributes,
  type InjectionKey,
  type PropType,
} from "vue";
import { partAttributes, type HtmlPart, type StyledPart } from "./parts.js";

export type ButtonSize = "sm" | "md" | "lg";
export type ButtonVariant = "bordered" | "borderless" | "prominent";

const groupOptions = {
  size: String as PropType<ButtonSize>,
  variant: String as PropType<ButtonVariant | "default">,
  orientation: String as PropType<"horizontal" | "vertical">,
  disabled: Boolean,
  fullWidth: Boolean,
  isDetached: Boolean,
  destructive: Boolean,
  tint: String,
};

export type GroupOptions = import("vue").ExtractPublicPropTypes<typeof groupOptions>;
export const ButtonGroupContext: InjectionKey<
  Readonly<import("vue").ExtractPropTypes<typeof groupOptions>>
> = Symbol("ButtonGroup");

const Group = defineComponent({
  name: "LensoButtonGroup",
  inheritAttrs: false,
  props: groupOptions,
  setup(props, { attrs, slots }) {
    provide(ButtonGroupContext, props);
    const { element, paint } = useGlassFusion(
      () => !props.isDetached,
      () => 18,
    );
    return () =>
      h(
        "fieldset",
        {
          ...partAttributes(
            "button-group",
            [
              glassContainerStyles.root,
              buttonGroupStyles.root,
              buttonGroupStyles[props.orientation ?? "horizontal"],
              props.fullWidth && buttonGroupStyles.fullWidth,
              props.isDetached && buttonGroupStyles.detached,
            ],
            {
              ...attrs,
              disabled: props.disabled,
              "data-lenso-glass-group": props.isDetached ? undefined : "",
            },
          ),
          ref: element,
        },
        [slots["default"]?.(), paint()],
      );
  },
});

const Separator = defineComponent({
  name: "LensoButtonGroupSeparator",
  inheritAttrs: false,
  setup(_, { attrs }) {
    const group = inject(ButtonGroupContext, undefined);
    return () =>
      h(
        "span",
        partAttributes(
          "button-group-separator",
          [
            buttonGroupStyles.separator,
            group?.orientation === "vertical"
              ? buttonGroupStyles.separatorVertical
              : buttonGroupStyles.separatorHorizontal,
          ],
          { "aria-hidden": "true", ...attrs },
        ),
      );
  },
});

export const ButtonGroupRoot = Group as unknown as StyledPart<typeof Group, FieldsetHTMLAttributes>;
export const ButtonGroupSeparator = Separator as unknown as HtmlPart<"span">;
export const ButtonGroup: typeof ButtonGroupRoot & {
  Root: typeof ButtonGroupRoot;
  Separator: typeof ButtonGroupSeparator;
} = Object.assign(ButtonGroupRoot, { Root: ButtonGroupRoot, Separator: ButtonGroupSeparator });
