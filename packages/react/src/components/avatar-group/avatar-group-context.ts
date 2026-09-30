import { createContext } from "react";
export type AvatarGroupAppearance = {
  size?: "sm" | "md" | "lg";
  color?: "default" | "accent" | "success" | "warning" | "danger";
  variant?: "default" | "soft";
};
export const AvatarGroupContext = createContext<AvatarGroupAppearance & { clipped?: boolean }>({});
