import {
  avatarStyles,
  avatarSizes,
  avatarFallbackSizes,
  avatarColors,
  avatarSoft,
} from "@lenso/tokens/avatar";
import {
  Avatar as SdkRoot,
  AvatarImage as SdkImage,
  AvatarFallback as SdkFallback,
} from "@ui-sdk/vue/avatar";
import { defineComponent, h, inject, provide, type InjectionKey, type PropType } from "vue";
import { partAttributes, sdkPart, type StyledPart } from "./parts.js";

type Appearance = {
  size?: keyof typeof avatarSizes;
  color?: keyof typeof avatarColors;
  variant?: "default" | "soft";
  clipped?: boolean;
};
const AppearanceContext: InjectionKey<() => Appearance> = Symbol("AvatarAppearance");
const appearanceProps = {
  size: String as PropType<keyof typeof avatarSizes>,
  color: String as PropType<keyof typeof avatarColors>,
  variant: String as PropType<"default" | "soft">,
};

export const AvatarRoot = defineComponent({
  inheritAttrs: false,
  props: { ...appearanceProps, clipped: Boolean },
  setup(props, { attrs, slots }) {
    provide(AppearanceContext, () => props);
    return () =>
      h(
        SdkRoot,
        partAttributes(
          "avatar",
          [
            avatarStyles.root,
            avatarSizes[props.size ?? "md"],
            props.variant === "soft" && avatarStyles.soft,
          ],
          attrs,
        ),
        slots,
      );
  },
}) as unknown as StyledPart<typeof SdkRoot, Appearance>;
export const AvatarImage: StyledPart<typeof SdkImage> = sdkPart(
  SdkImage,
  "avatar-image",
  () => avatarStyles.image,
);
export const AvatarFallback = defineComponent({
  inheritAttrs: false,
  props: appearanceProps,
  setup(props, { attrs, slots }) {
    const appearance = inject(AppearanceContext, () => ({}) as Appearance);
    return () => {
      const root = appearance(),
        color = props.color ?? root.color ?? "default";
      return h(
        SdkFallback,
        partAttributes(
          "avatar-fallback",
          [
            avatarStyles.fallback,
            avatarFallbackSizes[props.size ?? root.size ?? "md"],
            avatarColors[color],
            (props.variant ?? root.variant) === "soft" && avatarSoft[color],
            root.clipped && avatarStyles.clippedFallback,
          ],
          attrs,
        ),
        slots,
      );
    };
  },
}) as unknown as StyledPart<typeof SdkFallback, Appearance>;
export const Avatar: typeof AvatarRoot & {
  Root: typeof AvatarRoot;
  Image: typeof AvatarImage;
  Fallback: typeof AvatarFallback;
} = Object.assign(AvatarRoot, {
  Root: AvatarRoot,
  Image: AvatarImage,
  Fallback: AvatarFallback,
});
