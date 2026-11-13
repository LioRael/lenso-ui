"use client";
import { FloppyDisk } from "@gravity-ui/icons";
import {
  GlassButton,
  Button,
  Description,
  FieldError,
  Fieldset,
  Form,
  Input,
  Label,
  TextArea,
  TextField,
} from "@lenso/ui";
import { useId, type FormEvent } from "react";
import { demoStyles } from "../../demo.stylex";

export function Basic() {
  const descriptionId = useId();
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    alert("Form submitted successfully!");
  }
  return (
    <Form xstyle={demoStyles.wideColumn} onSubmit={onSubmit}>
      <Fieldset aria-describedby={descriptionId}>
        <Fieldset.Legend>Profile Settings</Fieldset.Legend>
        <Description id={descriptionId}>Update your profile information.</Description>
        <Fieldset.Group>
          <TextField name="name">
            <Label required>Name</Label>
            <Input
              required
              placeholder="John Doe"
              onInput={(event) => {
                const message = ((value: string) =>
                  String(value).length < 3 ? "Name must be at least 3 characters" : null)(
                  event.currentTarget.value,
                );
                event.currentTarget.setCustomValidity(message ?? "");
              }}
            />
            <FieldError />
          </TextField>
          <TextField name="email">
            <Label required>Email</Label>
            <Input required type="email" placeholder="john@example.com" />
            <FieldError />
          </TextField>
          <TextField name="bio" layout="stacked">
            <Label required>Bio</Label>
            <TextArea
              required
              placeholder="Tell us about yourself..."
              onInput={(event) => {
                const message = ((value: string) =>
                  String(value).length < 10 ? "Bio must be at least 10 characters" : null)(
                  event.currentTarget.value,
                );
                event.currentTarget.setCustomValidity(message ?? "");
              }}
            />
            <Description>Minimum 10 characters</Description>
            <FieldError />
          </TextField>
        </Fieldset.Group>
        <Fieldset.Actions>
          <Button type="submit">
            <FloppyDisk aria-hidden="true" />
            Save changes
          </Button>
          <GlassButton type="reset" variant="default">
            Cancel
          </GlassButton>
        </Fieldset.Actions>
      </Fieldset>
    </Form>
  );
}
