import { createOptionalContext } from "../context.js";
export type CheckboxVariant = "primary" | "secondary";
const [get, set] = createOptionalContext<() => CheckboxVariant>();
export const CheckboxVariantContext = { get, set };
