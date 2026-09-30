"use client";
/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import { Button } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { NativeAutocomplete, styles, type Option } from "./_native";
import { states } from "./default";

const countries = [
  { id: "usa", name: "United States" },
  { id: "canada", name: "Canada" },
  { id: "mexico", name: "Mexico" },
  { id: "uk", name: "United Kingdom" },
  { id: "france", name: "France" },
  { id: "germany", name: "Germany" },
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
          alert("Form submitted successfully!");
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
        label="State"
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
        label="Country"
        name="country"
        required
        value={country}
        onValueChange={setCountry}
        invalid={submitted && !country}
        error={submitted && !country ? "Please select a country." : undefined}
        placeholder="Select a country"
        searchLabel="Search countries"
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
