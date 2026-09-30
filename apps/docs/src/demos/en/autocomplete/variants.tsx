"use client";
/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import * as stylex from "@stylexjs/stylex";
import { NativeAutocomplete, styles } from "./_native";
const items = [1, 2, 3, 4].map((number) => ({ id: `option${number}`, name: `Option ${number}` }));
export function Variants() {
  return (
    <div {...stylex.props(styles.section)}>
      <section {...stylex.props(styles.stack)}>
        <h3>Single Select Variants</h3>
        <NativeAutocomplete items={items} label="Primary variant" variant="primary" />
        <NativeAutocomplete items={items} label="Secondary variant" variant="secondary" />
      </section>
      <section {...stylex.props(styles.stack)}>
        <h3>Multiple Select Variants</h3>
        <NativeAutocomplete
          items={items}
          label="Primary variant"
          variant="primary"
          placeholder="Select multiple"
          multiple
          chips
        />
        <NativeAutocomplete
          items={items}
          label="Secondary variant"
          variant="secondary"
          placeholder="Select multiple"
          multiple
          chips
        />
      </section>
    </div>
  );
}
