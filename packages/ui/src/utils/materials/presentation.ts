import type { MaterialVariant } from "@lenso/tokens/materials";

// Roles mapped to the supplied iOS 27 reference; solid content uses theme colors.
export const presentationMaterials = {
  anchored: "thick",
  compact: "glass-medium",
  sheet: "glass-medium",
  toast: "glass-small",
  notification: "glass-clear",
} as const satisfies Record<string, MaterialVariant>;
