"use client";

// Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0
import * as stylex from "@stylexjs/stylex";
import { exampleStyles, SelectExample } from "../../en/select/select-example";
const choices = [
  {
    value: "option1",
    label: "选项 1",
  },
  {
    value: "option2",
    label: "选项 2",
  },
];
export function Variants() {
  return (
    <div {...stylex.props(exampleStyles.stack)}>
      <SelectExample label="主要变体" choices={choices} variant="primary" />
      <SelectExample label="次要变体" choices={choices} variant="secondary" />
    </div>
  );
}
