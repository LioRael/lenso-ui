"use client";

import { useState } from "react";
import { Button, InputGroup, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  scene: {
    width: "100%",
    maxWidth: 440,
    padding: 24,
    boxSizing: "border-box",
    borderRadius: 32,
    backgroundImage:
      "linear-gradient(135deg, color-mix(in srgb, var(--lenso-tint) 18%, var(--lenso-background-grouped-primary)), var(--lenso-background-grouped-secondary))",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  status: { color: "var(--lenso-label-primary)", fontSize: 14, minHeight: 20 },
});

export function Glass() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  return (
    <form
      {...stylex.props(styles.scene)}
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(query.trim());
      }}
    >
      <TextField name="query">
        <InputGroup glass fullWidth>
          <InputGroup.Input
            aria-label="Search this example"
            placeholder="Search this example"
            value={query}
            onValueChange={setQuery}
          />
          <InputGroup.Suffix>
            <Button type="submit" size="sm" disabled={!query.trim()}>
              Search
            </Button>
          </InputGroup.Suffix>
        </InputGroup>
      </TextField>
      <TextField name="notes">
        <InputGroup glass fullWidth>
          <InputGroup.TextArea aria-label="Notes" placeholder="Add notes" rows={3} />
        </InputGroup>
      </TextField>
      <output aria-live="polite" {...stylex.props(styles.status)}>
        {submitted ? `Submitted query: ${submitted}` : "Enter a query to try the floating input."}
      </output>
    </form>
  );
}
