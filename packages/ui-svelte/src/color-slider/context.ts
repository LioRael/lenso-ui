import { createOptionalContext } from "../context.js";
export const [getChannel, setChannel] = createOptionalContext<() => number>();
