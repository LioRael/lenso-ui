"use client";
import { Surface } from "@lenso/ui";
import { NativeAutocomplete, styles } from "./_native";
import { states } from "./default";
export function FullWidth() {
  return (
    <Surface xstyle={[styles.surface, styles.fullSurface]}>
      <NativeAutocomplete
        items={states}
        label="State"
        variant="secondary"
        fullWidth
        searchLabel="Search states"
      />
    </Surface>
  );
}
