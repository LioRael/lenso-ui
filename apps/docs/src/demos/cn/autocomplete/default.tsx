// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Autocomplete } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { demoStyles } from "../../demo.stylex";
const states = ["Florida", "Delaware", "California", "Texas", "New York", "Washington"];
export function Default() {
  return (
    <div {...stylex.props(demoStyles.field)}>
      <Autocomplete items={states} multiple>
        <Autocomplete.Label>States to visit</Autocomplete.Label>
        <Autocomplete.Trigger>
          <Autocomplete.Value placeholder="选择州/省" />
          <Autocomplete.Indicator />
        </Autocomplete.Trigger>
        <Autocomplete.Portal>
          <Autocomplete.Positioner>
            <Autocomplete.Popover>
              <Autocomplete.Input aria-label="Search states" placeholder="搜索…" />
              <Autocomplete.List>
                {(state: string) => (
                  <Autocomplete.Item key={state} value={state}>
                    {state}
                    <Autocomplete.ItemIndicator />
                  </Autocomplete.Item>
                )}
              </Autocomplete.List>
            </Autocomplete.Popover>
          </Autocomplete.Positioner>
        </Autocomplete.Portal>
      </Autocomplete>
    </div>
  );
}
