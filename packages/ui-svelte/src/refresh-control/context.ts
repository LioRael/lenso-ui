import { createOptionalContext } from "../context.js";

type Phase = "idle" | "pulling" | "armed" | "refreshing" | "complete" | "error";

export type RefreshVisual = { phase: Phase; distance: number };
const [getContext, setRefresh] = createOptionalContext<{
  visual: () => RefreshVisual;
  threshold: () => number;
  label: () => string;
  message: () => string;
  disabled: () => boolean;
  refresh: () => Promise<void>;
  bind: (node: HTMLDivElement) => () => void;
}>();

export { setRefresh };
export function getRefresh() {
  const context = getContext();
  if (!context) throw new Error("RefreshControl parts require RefreshControl.Root");
  return context;
}
