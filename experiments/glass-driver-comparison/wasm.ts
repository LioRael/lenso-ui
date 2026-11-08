import init from "./generated/runtime.js";
import { binary } from "./generated/binary";
await init({ module_or_path: Uint8Array.from(atob(binary), (c) => c.charCodeAt(0)) });
export { GlassRenderer } from "./generated/runtime.js";
