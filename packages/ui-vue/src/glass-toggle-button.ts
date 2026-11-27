import { toggleButtonStyles } from "@lenso/tokens/toggle-button";
import { Toggle as SdkToggle } from "@ui-sdk/vue/toggle";
import { defineComponent, h } from "vue";
import {
  GlassButtonIcon,
  glassControlProps,
  glassControlStyles,
  glassControlLifecycle,
  type GlassButtonAppearance,
} from "./glass-button.js";
import { useGlassElement } from "./glass.js";
import { partAttributes, type ComponentProps, type StyledPart } from "./parts.js";

type Options = GlassButtonAppearance & { elastic?: boolean };
export const GlassToggleButtonRoot: StyledPart<typeof SdkToggle, Options> = defineComponent({
  name: "LensoGlassToggleButton",
  inheritAttrs: false,
  props: glassControlProps,
  setup(props, { attrs, slots }) {
    const element = useGlassElement(() => props.elastic && !props.disabled);
    const lifecycle = glassControlLifecycle(element);
    return () =>
      h(
        SdkToggle,
        {
          ...partAttributes(
            "glass-toggle-button",
            [
              glassControlStyles(props),
              toggleButtonStyles.selected,
              props.variant === "prominent" && toggleButtonStyles.prominentSelected,
            ],
            { ...attrs, disabled: props.disabled, "data-glass": "true" },
          ),
          ...lifecycle,
        },
        slots,
      );
  },
}) as unknown as StyledPart<typeof SdkToggle, Options>;
export type GlassToggleButtonProps = ComponentProps<typeof GlassToggleButtonRoot>;
export const GlassToggleButton: typeof GlassToggleButtonRoot & {
  Root: typeof GlassToggleButtonRoot;
  Icon: typeof GlassButtonIcon;
} = Object.assign(GlassToggleButtonRoot, { Root: GlassToggleButtonRoot, Icon: GlassButtonIcon });
