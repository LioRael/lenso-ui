"use client";
/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
import { SelectExample, states } from "./select-example";
export function RenderFunction() {
  return <SelectExample customRender label="State" choices={states} />;
}
