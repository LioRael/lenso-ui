"use client";
import { Fieldset, Input, TextArea, TextField } from "@lenso/ui";
import { s } from "../card/display.stylex";

export function WithFormComponents() {
  return (
    <Fieldset xstyle={s.maxMd}>
      <Fieldset.Legend>Profile</Fieldset.Legend>
      <Fieldset.Group>
        <TextField name="name">
          <TextField.Label>Name</TextField.Label>
          <Input placeholder="Name" />
        </TextField>
        <TextField name="notes" layout="stacked">
          <TextField.Label>Notes</TextField.Label>
          <TextArea placeholder="Add a note" fullWidth />
        </TextField>
      </Fieldset.Group>
    </Fieldset>
  );
}
