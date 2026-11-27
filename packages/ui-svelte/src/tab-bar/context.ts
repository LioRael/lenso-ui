import { createOptionalContext } from "../context.js";

export type TabBarLayout = "phone" | "tablet" | "vertical";
export const [getTabBar, setTabBar] = createOptionalContext<{
  elastic: () => boolean;
  layout: () => TabBarLayout;
  minimized: () => boolean;
  expandLabel: () => string;
  changeMinimized: (next: boolean) => void;
}>();
export const [getSeparate, setSeparate] = createOptionalContext<() => boolean>();
