// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Checkbox } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    display: "flex",
    gap: "1rem",
  },
});
export function CustomIndicator() {
  return (
    <div {...stylex.props(styles.root)}>
      <Checkbox defaultChecked name="heart">
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator
              render={(props, { checked }) => (
                <span {...props}>
                  {checked ? (
                    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.62 20.81c-.34.12-.9.12-1.24 0C8.48 19.82 2 15.69 2 8.69 2 5.6 4.49 3.1 7.56 3.1c1.82 0 3.43.88 4.44 2.24a5.53 5.53 0 0 1 4.44-2.24C19.51 3.1 22 5.6 22 8.69c0 7-6.48 11.13-9.38 12.12Z" />
                    </svg>
                  ) : null}
                </span>
              )}
            />
          </Checkbox.Control>
          心形
        </Checkbox.Content>
      </Checkbox>
      <Checkbox defaultChecked name="plus">
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator
              render={(props, { checked }) => (
                <span {...props}>
                  {checked ? (
                    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M6 12H18"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                      />
                      <path
                        d="M12 18V6"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                      />
                    </svg>
                  ) : null}
                </span>
              )}
            />
          </Checkbox.Control>
          加号
        </Checkbox.Content>
      </Checkbox>
      <Checkbox indeterminate name="indeterminate">
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator
              render={(props, { indeterminate }) => (
                <span {...props}>
                  {indeterminate ? (
                    <svg
                      aria-hidden="true"
                      stroke="currentColor"
                      strokeWidth={3}
                      viewBox="0 0 24 24"
                    >
                      <line x1="21" x2="3" y1="12" y2="12" />
                    </svg>
                  ) : null}
                </span>
              )}
            />
          </Checkbox.Control>
          部分选中
        </Checkbox.Content>
      </Checkbox>
    </div>
  );
}
