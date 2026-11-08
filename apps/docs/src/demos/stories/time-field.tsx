"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface TimeFieldStoryProps extends Pick<
  StoryComponentProps<typeof TimeField>,
  | "disabled"
  | "required"
  | "readOnly"
  | "hourCycle"
  | "hideTimeZone"
  | "shouldForceLeadingZeros"
  | "isInvalid"
  | "fullWidth"
> {}
export const initialArgs: TimeFieldStoryProps = /* story-args:start */ {
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
import { TimeField } from "@lenso/ui";
import { styles } from "../en/date-field/demo-styles";

export function Basic(overrides: TimeFieldStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <TimeField xstyle={styles.field} name="time" {...args}>
      <TimeField.Label>Time</TimeField.Label>
      <TimeField.Group>
        <TimeField.Input>{(segment) => <TimeField.Segment segment={segment} />}</TimeField.Input>
      </TimeField.Group>
    </TimeField>
  );
}
