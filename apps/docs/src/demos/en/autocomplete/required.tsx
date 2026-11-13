"use client";
import { useState } from "react";
import { Button, Form } from "@lenso/ui";
import { TextSuggestions } from "./text-suggestions";
import { states } from "./default";
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
        label="State to visit"
        options={states.map((item) => item.name)}
      />
      <Button type="submit">Submit destination</Button>
      <output>{result}</output>
    </Form>
  );
}
