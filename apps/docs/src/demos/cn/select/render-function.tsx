"use client";

// Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0
import { SelectExample, states } from "./render-function--select-example";
export function RenderFunction() {
  return <SelectExample customRender label="州" choices={states} />;
}
