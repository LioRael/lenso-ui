// Supplemental native-contract consumer; not additional source stories.
import { useRef, useState } from "react";
import { Button, Form, NumberField, InputOTP, TextField, Label, FieldError } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { formWorkflowStyles as s } from "./form-workflow.stylex";

export function FormWorkflowContract() {
  const [number, setNumber] = useState<number | null>(1234.5);
  const [output, setOutput] = useState("");
  const [locale, setLocale] = useState("de-DE");
  const [disabled, setDisabled] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLFormElement>(null);
  return (
    <div {...stylex.props(s.stack)}>
      <Form
        ref={form}
        onFormSubmit={() => {
          if (form.current)
            setOutput(JSON.stringify(Object.fromEntries(new FormData(form.current))));
        }}
      >
        <TextField name="amount" disabled={disabled}>
          <NumberField
            ref={root}
            name="amount"
            value={number}
            onValueChange={setNumber}
            locale={locale}
            format={{ style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            min={0}
            max={2000}
            step={0.5}
            required
            disabled={disabled}
          >
            <Label required>Localized amount</Label>
            <NumberField.Group>
              <NumberField.DecrementButton />
              <NumberField.Input ref={input} />
              <NumberField.IncrementButton />
            </NumberField.Group>
          </NumberField>
          <FieldError match="valueMissing">Amount is required</FieldError>
        </TextField>
        <TextField name="code">
          <Label>Normalized letters</Label>
          <InputOTP
            length={4}
            name="code"
            required
            validationType="alpha"
            normalizeValue={(value) => value.toUpperCase()}
          >
            <InputOTP.Group>
              <InputOTP.Slot />
              <InputOTP.Slot />
              <InputOTP.Slot />
              <InputOTP.Slot />
            </InputOTP.Group>
          </InputOTP>
          <FieldError match="valueMissing">Code is required</FieldError>
        </TextField>
        <Button type="submit">Submit native values</Button>
      </Form>
      <Button
        onClick={() => {
          input.current?.focus();
          setOutput(`refs:${input.current?.tagName}/${root.current?.tagName}`);
        }}
      >
        Focus number ref
      </Button>
      <Button onClick={() => setLocale(locale === "de-DE" ? "en-US" : "de-DE")}>
        Switch locale
      </Button>
      <Button onClick={() => setDisabled(!disabled)}>Toggle disabled</Button>
      <output aria-label="Native result">{output}</output>
    </div>
  );
}
