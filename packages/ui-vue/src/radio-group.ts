import { RadioGroupRoot } from "./radio.js";

export { RadioGroupRoot };
export const RadioGroup: typeof RadioGroupRoot & { Root: typeof RadioGroupRoot } = Object.assign(
  RadioGroupRoot,
  { Root: RadioGroupRoot },
);
