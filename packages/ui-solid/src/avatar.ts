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
} from "@ui-sdk/solid/avatar";
import { type ComponentProps } from "solid-js";
import { sdkPart, type StyledPart } from "./parts.js";

export const AvatarRoot: StyledPart<
  typeof SdkRoot,
  { size?: keyof typeof avatarSizes; variant?: "default" | "soft" }
> = sdkPart<
  ComponentProps<typeof SdkRoot>,
  { size?: keyof typeof avatarSizes; variant?: "default" | "soft" }
>(
  SdkRoot,
  "avatar",
  (props) => [
    avatarStyles.root,
    avatarSizes[props.size ?? "md"],
    props.variant === "soft" && avatarStyles.soft,
  ],
  "size",
  "variant",
);
export const AvatarImage: StyledPart<typeof SdkImage> = sdkPart(
  SdkImage,
  "avatar-image",
  () => avatarStyles.image,
);
export const AvatarFallback: StyledPart<
  typeof SdkFallback,
  {
    size?: keyof typeof avatarFallbackSizes;
    color?: keyof typeof avatarColors;
    variant?: "default" | "soft";
  }
> = sdkPart<
  ComponentProps<typeof SdkFallback>,
  {
    size?: keyof typeof avatarFallbackSizes;
    color?: keyof typeof avatarColors;
    variant?: "default" | "soft";
  }
>(
  SdkFallback,
  "avatar-fallback",
  (props) => [
    avatarStyles.fallback,
    avatarFallbackSizes[props.size ?? "md"],
    avatarColors[props.color ?? "default"],
    props.variant === "soft" && avatarSoft[props.color ?? "default"],
  ],
  "size",
  "color",
  "variant",
);

export const Avatar: typeof AvatarRoot & {
  Root: typeof AvatarRoot;
  Image: typeof AvatarImage;
  Fallback: typeof AvatarFallback;
} = Object.assign(AvatarRoot, {
  Root: AvatarRoot,
  Image: AvatarImage,
  Fallback: AvatarFallback,
});
