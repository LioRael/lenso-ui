import { buttonGroupItemStyles } from "@lenso/tokens/button-group";
import {
  glassButtonIconOnlySizes,
  glassButtonSizes,
  glassButtonStyles,
  glassButtonVariants,
} from "@lenso/tokens/glass-button";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import { Button as SdkButton } from "@ui-sdk/vue/button";
import { defineComponent, h, inject, type PropType, type VNode } from "vue";
import { ButtonGroupContext } from "./button-group.js";
import { useGlassElement } from "./glass.js";
import { htmlPart, partAttributes, type ComponentProps, type StyledPart } from "./parts.js";

export type GlassButtonAppearance = {
  size?: keyof typeof glassButtonSizes;
  variant?: keyof typeof glassButtonVariants;
  tint?: string;
  fullWidth?: boolean;
  isIconOnly?: boolean;
};

export const glassControlProps = {
  size: String as PropType<GlassButtonAppearance["size"]>,
  variant: String as PropType<GlassButtonAppearance["variant"]>,
  tint: String,
  fullWidth: { type: Boolean, default: undefined },
  isIconOnly: Boolean,
  elastic: { type: Boolean, default: true },
  disabled: Boolean,
};

export function glassControlStyles(props: GlassButtonAppearance) {
  return [
    glassButtonStyles.root,
    liquidMaterialStyles.small,
    glassButtonStyles.backdrop,
    glassButtonSizes[props.size ?? "md"],
    glassButtonVariants[props.variant ?? "default"],
    glassButtonStyles.interaction,
    props.isIconOnly && glassButtonStyles.iconOnly,
    props.isIconOnly && glassButtonIconOnlySizes[props.size ?? "md"],
    props.fullWidth && glassButtonStyles.fullWidth,
    props.tint ? glassButtonStyles.tint(props.tint) : false,
  ] as const;
}

export function glassControlLifecycle(element: ReturnType<typeof useGlassElement>) {
  const connect = ({ el }: VNode) => {
    element.value = el instanceof HTMLElement ? el : undefined;
  };
  return {
    onVnodeMounted: connect,
    onVnodeUpdated: connect,
    onVnodeBeforeUnmount: () => {
      element.value = undefined;
    },
  };
}

export const GlassButtonIcon = htmlPart("span", "button-icon", () => glassButtonStyles.icon);
const PressHighlight = htmlPart(
  "span",
  "glass-button-press-highlight",
  () => liquidMaterialStyles.pressHighlight,
);

export const GlassButtonRoot: StyledPart<
  typeof SdkButton,
  GlassButtonAppearance & { elastic?: boolean; destructive?: boolean }
> = defineComponent({
  name: "LensoGlassButton",
  inheritAttrs: false,
  props: { ...glassControlProps, destructive: { type: Boolean, default: undefined } },
  setup(props, { attrs, slots }) {
    const group = inject(ButtonGroupContext, undefined);
    const disabled = () => props.disabled || !!group?.disabled;
    const element = useGlassElement(() => props.elastic && !disabled());
    const lifecycle = glassControlLifecycle(element);
    return () =>
      h(
        SdkButton,
        {
          ...partAttributes(
            "glass-button",
            [
              glassControlStyles({
                ...props,
                size: props.size ?? group?.size,
                variant:
                  props.variant ?? (group?.variant === "prominent" ? "prominent" : "default"),
                tint: props.tint ?? group?.tint,
                fullWidth: props.fullWidth ?? group?.fullWidth,
              }),
              (props.destructive ?? group?.destructive) && glassButtonStyles.destructive,
              group &&
                !group.isDetached &&
                buttonGroupItemStyles[group.orientation ?? "horizontal"],
              group?.fullWidth && buttonGroupItemStyles.stretch,
            ],
            {
              ...attrs,
              disabled: disabled(),
              "data-lenso-group-item": group ? "" : undefined,
              "data-glass": "true",
              "data-icon": props.isIconOnly ? "only" : undefined,
            },
          ),
          ...lifecycle,
        },
        {
          ...slots,
          default: (scope: Record<string, unknown>) => [
            h(PressHighlight, { "aria-hidden": "true" }),
            slots["default"]?.(scope),
          ],
        },
      );
  },
}) as unknown as StyledPart<
  typeof SdkButton,
  GlassButtonAppearance & { elastic?: boolean; destructive?: boolean }
>;
export type GlassButtonProps = ComponentProps<typeof GlassButtonRoot>;

export const GlassButton: typeof GlassButtonRoot & {
  Root: typeof GlassButtonRoot;
  Icon: typeof GlassButtonIcon;
} = Object.assign(GlassButtonRoot, { Root: GlassButtonRoot, Icon: GlassButtonIcon });
