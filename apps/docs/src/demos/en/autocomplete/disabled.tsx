"use client";
/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import * as stylex from "@stylexjs/stylex";
import { NativeAutocomplete, styles } from "./_native";
import { states } from "./default";
const countries = [
  { id: "argentina", name: "Argentina" },
  { id: "venezuela", name: "Venezuela" },
  { id: "japan", name: "Japan" },
  { id: "france", name: "France" },
  { id: "italy", name: "Italy" },
  { id: "spain", name: "Spain" },
];
export function Disabled() {
  return (
    <div {...stylex.props(styles.stack)}>
      <NativeAutocomplete
        items={states}
        label="State"
        disabled
        defaultValue={states.find((item) => item.id === "california")}
      />
      <NativeAutocomplete
        items={countries}
        label="Countries to Visit"
        placeholder="Select countries"
        disabled
        multiple
        defaultValue={countries.filter((item) =>
          ["argentina", "japan", "france"].includes(item.id),
        )}
      />
    </div>
  );
}
