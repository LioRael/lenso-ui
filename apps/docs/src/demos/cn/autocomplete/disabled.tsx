// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import * as stylex from "@stylexjs/stylex";
import { NativeAutocomplete, styles } from "../../en/autocomplete/_native";
import { states } from "./default";
const countries = [
  {
    id: "argentina",
    name: "Argentina",
  },
  {
    id: "venezuela",
    name: "Venezuela",
  },
  {
    id: "japan",
    name: "Japan",
  },
  {
    id: "france",
    name: "France",
  },
  {
    id: "italy",
    name: "Italy",
  },
  {
    id: "spain",
    name: "Spain",
  },
];
export function Disabled() {
  return (
    <div {...stylex.props(styles.stack)}>
      <NativeAutocomplete
        items={states}
        label="州"
        disabled
        defaultValue={states.find((item) => item.id === "california")}
      />
      <NativeAutocomplete
        items={countries}
        label="计划前往的国家"
        placeholder="选择国家"
        disabled
        multiple
        defaultValue={countries.filter((item) =>
          ["argentina", "japan", "france"].includes(item.id),
        )}
      />
    </div>
  );
}
