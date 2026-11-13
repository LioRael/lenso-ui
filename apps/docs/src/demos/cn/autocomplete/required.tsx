"use client";
import { useState } from "react";
import { Button, Form } from "@lenso/ui";
import { TextSuggestions } from "../../en/autocomplete/text-suggestions";
import { states } from "../../en/autocomplete/default";
export function Required() {
  const [result, setResult] = useState("");
  return (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        setResult(String(new FormData(event.currentTarget).get("destination")));
      }}
    >
      <TextSuggestions
        required
        name="destination"
        label="计划前往的州"
        options={states.map((item) => item.name)}
      />
      <Button type="submit">Submit destination</Button>
      <output>{result}</output>
    </Form>
  );
}
