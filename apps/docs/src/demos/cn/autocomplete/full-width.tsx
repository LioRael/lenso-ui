// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import { Surface } from "@lenso/ui";
import { NativeAutocomplete, styles } from "../../en/autocomplete/_native";
import { states } from "./default";
export function FullWidth() {
  return (
    <Surface xstyle={[styles.surface, styles.fullSurface]}>
      <NativeAutocomplete
        items={states}
        label="州"
        variant="secondary"
        fullWidth
        searchLabel="Search states"
      />
    </Surface>
  );
}
