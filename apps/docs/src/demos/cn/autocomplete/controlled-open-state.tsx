// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import { Button } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { NativeAutocomplete, styles } from "../../en/autocomplete/_native";
import { states } from "./default";
export function ControlledOpenState() {
  const [open, setOpen] = useState(false);
  return (
    <div {...stylex.props(styles.stack)}>
      <NativeAutocomplete
        items={states}
        label="州"
        searchLabel="Search states"
        open={open}
        onOpenChange={setOpen}
      />
      <Button onClick={() => setOpen(!open)}>{open ? "关闭" : "打开"}自动完成</Button>
      <p {...stylex.props(styles.muted)}>Autocomplete is {open ? "打开" : "关闭"}</p>
    </div>
  );
}
