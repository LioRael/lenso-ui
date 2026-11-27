import { createOptionalContext } from "../context.js";
import type { progressCircleSizes } from "@lenso/tokens/progress-circle";

export const [getProgress, setProgress] = createOptionalContext<
  () => {
    size: keyof typeof progressCircleSizes;
    value?: number | null;
    min: number;
    max: number;
  }
>();
