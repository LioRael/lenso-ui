"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface DateFieldStoryProps extends Pick<
  StoryComponentProps<typeof DateField>,
  | "disabled"
  | "required"
  | "readOnly"
  | "hourCycle"
  | "hideTimeZone"
  | "shouldForceLeadingZeros"
  | "isInvalid"
  | "fullWidth"
> {}
export const initialArgs: DateFieldStoryProps = /* story-args:start */ {
  disabled: false,
  required: false,
  readOnly: false,
  hourCycle: 12,
  hideTimeZone: false,
  shouldForceLeadingZeros: false,
  isInvalid: false,
  fullWidth: false,
}; /* story-args:end */

// Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { DateField } from "@lenso/ui";
import { styles } from "../en/date-field/demo-styles";

export function Basic(overrides: DateFieldStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <DateField xstyle={styles.field} name="date" {...args}>
      <DateField.Label>Date</DateField.Label>
      <DateField.Group>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
      </DateField.Group>
    </DateField>
  );
}
