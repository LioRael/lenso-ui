"use client";

// Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import { Calendar, ChevronDown } from "@gravity-ui/icons";
import { DateField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/date-field/demo-styles";
export function WithPrefixAndSuffix() {
  return (
    <DateField xstyle={styles.field} name="date">
      <DateField.Label>日期</DateField.Label>
      <DateField.Group>
        <DateField.Prefix>
          <Calendar {...stylex.props(styles.icon)} aria-hidden="true" />
        </DateField.Prefix>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        <DateField.Suffix>
          <ChevronDown {...stylex.props(styles.icon)} aria-hidden="true" />
        </DateField.Suffix>
      </DateField.Group>
      <DateField.Description>输入日期</DateField.Description>
    </DateField>
  );
}
