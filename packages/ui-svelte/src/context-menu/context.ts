import { createOptionalContext } from "../context.js";
export const [getCompact, setCompact] = createOptionalContext<{
  active: () => boolean;
  expand: () => void;
}>();
