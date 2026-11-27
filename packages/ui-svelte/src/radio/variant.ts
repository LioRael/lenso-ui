import { createOptionalContext } from "../context.js";
export type RadioVariant = "primary" | "secondary";
const [get, set] = createOptionalContext<() => RadioVariant>();
export const RadioVariantContext = { get, set };
