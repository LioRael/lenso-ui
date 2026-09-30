"use client";
/** HeroUI v3.2.6 demo support, adapted to native Base UI selection. Apache-2.0. */
import { Select } from "@lenso/ui";
import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./source.stylex";
export function ColorDemoSelect<Value extends string>({
  label,
  value,
  options,
  onChange,
  width,
  uppercase = false,
}: {
  label: string;
  value: Value;
  options: readonly Value[];
  onChange: (value: Value) => void;
  width?: 128 | 144;
  uppercase?: boolean;
}) {
  const id = useId();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setContainer}
      {...stylex.props(
        styles.column2,
        width === 128 && styles.width128,
        width === 144 && styles.width144,
      )}
    >
      {width && (
        <span id={id} {...stylex.props(styles.label)}>
          {label}
        </span>
      )}
      <Select
        value={value}
        onValueChange={(next) => {
          if (next !== null) onChange(next);
        }}
        variant="secondary"
      >
        <Select.Trigger
          aria-label={width ? undefined : label}
          aria-labelledby={width ? id : undefined}
        >
          <Select.Value xstyle={uppercase ? styles.uppercase : styles.capitalize} />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Portal container={container}>
          <Select.Positioner xstyle={styles.selectPositioner}>
            <Select.Popover>
              <Select.List>
                {options.map((option) => (
                  <Select.Item key={option} value={option}>
                    <Select.ItemText xstyle={uppercase ? styles.uppercase : styles.capitalize}>
                      {option}
                    </Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popover>
          </Select.Positioner>
        </Select.Portal>
      </Select>
    </div>
  );
}
