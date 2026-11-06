"use client";

import { createContext } from "react";
import type { FusionGroup } from "../fusion.js";

export const GlassFusionContext = createContext<FusionGroup | null>(null);
export { attachFusion, type FusionGroup } from "../fusion.js";
export { glassIsOpaque, observeGlassPreferences } from "../preferences.js";
