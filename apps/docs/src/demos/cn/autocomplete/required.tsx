// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import { Button } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { NativeAutocomplete, styles, type Option } from "../../en/autocomplete/_native";
import { states } from "./default";
const countries = [
  {
    id: "usa",
    name: "United States",
  },
  {
    id: "canada",
    name: "Canada",
  },
  {
    id: "mexico",
    name: "Mexico",
  },
  {
    id: "uk",
    name: "United Kingdom",
  },
  {
    id: "france",
    name: "France",
  },
  {
    id: "germany",
    name: "Germany",
  },
];
export function Required() {
  const [state, setState] = useState<Option | Option[] | null>(null);
  const [country, setCountry] = useState<Option | Option[] | null>(null);
  const [submitted, setSubmitted] = useState(false);
  return (
    <form
      noValidate
      {...stylex.props(styles.stack)}
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
        const data = new FormData(event.currentTarget);
        if (data.get("state") && data.get("country")) {
          alert("表单提交成功！");
          return;
        }
        const fields =
          event.currentTarget.querySelectorAll<HTMLButtonElement>('button[role="combobox"]');
        const firstInvalid = fields[data.get("state") ? 1 : 0];
        requestAnimationFrame(() => {
          if (firstInvalid?.isConnected) firstInvalid.focus();
        });
      }}
    >
      <NativeAutocomplete
        items={states}
        label="州"
        name="state"
        required
        value={state}
        onValueChange={setState}
        invalid={submitted && !state}
        error={submitted && !state ? "Please select a state." : undefined}
        searchLabel="Search states"
      />
      <NativeAutocomplete
        items={countries}
        label="国家"
        name="country"
        required
        value={country}
        onValueChange={setCountry}
        invalid={submitted && !country}
        error={submitted && !country ? "Please select a country." : undefined}
        placeholder="选择一个国家"
        searchLabel="Search countries"
      />
      <Button type="submit">提交</Button>
    </form>
  );
}
