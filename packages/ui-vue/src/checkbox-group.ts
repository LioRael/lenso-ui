import { CheckboxGroupRoot } from "./checkbox.js";

export { CheckboxGroupRoot };
export const CheckboxGroup: typeof CheckboxGroupRoot & { Root: typeof CheckboxGroupRoot } =
  Object.assign(CheckboxGroupRoot, { Root: CheckboxGroupRoot });
