"use client";

import { createContext } from "react";
import type { GlassBackdropSource } from "../backdrop-snapshot.js";

/** A scene can supply the complete paint behind its portalled glass surfaces. */
export const GlassBackdropSourceContext = createContext<GlassBackdropSource | undefined>(undefined);
