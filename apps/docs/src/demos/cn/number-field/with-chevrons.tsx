// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Label, NumberField, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/number-field/parts";
export function WithChevrons() {
  return (
    <TextField name="amount" xstyle={styles.field}>
      <NumberField
        defaultValue={99}
        min={0}
        name="amount"
        format={{
          currency: "EUR",
          currencySign: "accounting",
          style: "currency",
        }}
      >
        <Label>带 Chevron 的数字输入框</Label>
        <NumberField.Group>
          <NumberField.Input xstyle={styles.flexInput} />
          <div {...stylex.props(styles.chevrons)}>
            <NumberField.IncrementButton xstyle={[styles.chevronButton, styles.up]}>
              <svg
                aria-hidden="true"
                height="11"
                viewBox="0 0 16 16"
                width="11"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  d="M13.03 10.53a.75.75 0 0 1-1.06 0L8 6.56l-3.97 3.97a.75.75 0 1 1-1.06-1.06l4.5-4.5a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06"
                  fill="currentColor"
                  fillRule="evenodd"
                />
              </svg>
            </NumberField.IncrementButton>
            <NumberField.DecrementButton xstyle={[styles.chevronButton, styles.down]}>
              <svg
                aria-hidden="true"
                height="11"
                viewBox="0 0 16 16"
                width="11"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  d="M2.97 5.47a.75.75 0 0 1 1.06 0L8 9.44l3.97-3.97a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 0-1.06"
                  fill="currentColor"
                  fillRule="evenodd"
                />
              </svg>
            </NumberField.DecrementButton>
          </div>
        </NumberField.Group>
      </NumberField>
    </TextField>
  );
}
