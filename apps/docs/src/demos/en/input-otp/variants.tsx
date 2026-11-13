"use client";
import { InputOTP, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Slots, styles } from "./parts";
export function Variants() {
  return (
    <div {...stylex.props(styles.variants, styles.materialScene)}>
      {(
        [
          { variant: "primary", glass: false, label: "Ordinary material" },
          { variant: "secondary", glass: false, label: "Secondary material" },
          { variant: "primary", glass: true, label: "Glass material" },
        ] as const
      ).map(({ variant, glass, label }) => (
        <TextField key={label} name={label} xstyle={styles.field}>
          <Label>{label}</Label>
          <InputOTP maxLength={6} name={label} variant={variant} glass={glass}>
            <Slots />
          </InputOTP>
        </TextField>
      ))}
    </div>
  );
}
