// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Glisse 0.5.0 optical profiles, attached to Lenso's existing control motion.
import { createControlLens } from "../control-lens.js";

export function createLabelRefraction(element: HTMLElement) {
  return createControlLens(element, element, {
    strength: 0.3,
    dispersion: 0.1,
    depth: 2.5,
    dome: 0,
    splay: 1,
    ink: true,
    paintsLight: true,
    pill: true,
  });
}
