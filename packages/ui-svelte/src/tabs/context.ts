import { createOptionalContext } from "../context.js";

export const [getTabsOrientation, setTabsOrientation] =
  createOptionalContext<() => "horizontal" | "vertical">();
