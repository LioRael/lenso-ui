import { Glass } from "../glass/index.js";
import GlassContainerRoot from "./glass-container.svelte";

export type { GlassContainerProps } from "./glass-container.svelte";
export const GlassContainer = Object.assign(GlassContainerRoot, { Item: Glass });
