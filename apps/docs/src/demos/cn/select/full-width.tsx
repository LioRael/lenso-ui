"use client";

// Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0
import * as stylex from "@stylexjs/stylex";
import { exampleStyles, SelectExample } from "../../en/select/select-example";
export function FullWidth() {
  return (
    <div {...stylex.props(exampleStyles.wide, exampleStyles.stack)}>
      <SelectExample
        fluid
        label="喜爱的动物"
        choices={["Cat", "Dog", "Bird"].map((label) => ({
          label,
          value: label.toLowerCase(),
        }))}
      />
    </div>
  );
}
