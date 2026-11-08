"use client";

import * as stylex from "@stylexjs/stylex";
import { NativeAutocomplete, styles } from "../../en/autocomplete/_native";
const items = [1, 2, 3, 4].map((number) => ({
  id: `option${number}`,
  name: `Option ${number}`,
}));
export function Variants() {
  return (
    <div {...stylex.props(styles.section)}>
      <section {...stylex.props(styles.stack)}>
        <h3>单选变体</h3>
        <NativeAutocomplete items={items} label="主色（primary）变体" variant="primary" />
        <NativeAutocomplete items={items} label="次色（secondary）变体" variant="secondary" />
      </section>
      <section {...stylex.props(styles.stack)}>
        <h3>多选变体</h3>
        <NativeAutocomplete
          items={items}
          label="主色（primary）变体"
          variant="primary"
          placeholder="选择多项"
          multiple
          chips
        />
        <NativeAutocomplete
          items={items}
          label="次色（secondary）变体"
          variant="secondary"
          placeholder="选择多项"
          multiple
          chips
        />
      </section>
    </div>
  );
}
