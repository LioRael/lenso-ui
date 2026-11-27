import { createOptionalContext } from "../context.js";
export type GroupOptions = {
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "bordered" | "borderless" | "prominent" | "default";
  orientation?: "horizontal" | "vertical";
  fullWidth?: boolean;
  isDetached?: boolean;
  destructive?: boolean;
  tint?: string;
};
export const [getButtonGroup, setButtonGroup] = createOptionalContext<() => GroupOptions>();
