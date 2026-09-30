"use client";
/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import { Button } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { NativeAutocomplete, styles } from "./_native";
import { states } from "./default";
export function ControlledOpenState() {
  const [open, setOpen] = useState(false);
  return (
    <div {...stylex.props(styles.stack)}>
      <NativeAutocomplete
        items={states}
        label="State"
        searchLabel="Search states"
        open={open}
        onOpenChange={setOpen}
      />
      <Button onClick={() => setOpen(!open)}>{open ? "Close" : "Open"} Autocomplete</Button>
      <p {...stylex.props(styles.muted)}>Autocomplete is {open ? "open" : "closed"}</p>
    </div>
  );
}
