"use client";
// Adapted from HeroUI v3.2.6, Apache-2.0.
import { FloppyDisk } from "@gravity-ui/icons";
import {
  Button,
  Description,
  FieldError,
  FieldGroup,
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
        <FieldGroup>
          <TextField
            name="name"
            validate={(value) =>
              String(value).length < 3 ? "Name must be at least 3 characters" : null
            }
          >
            <Label required>Name</Label>
            <Input required placeholder="John Doe" />
            <FieldError />
          </TextField>
          <TextField name="email">
            <Label required>Email</Label>
            <Input required type="email" placeholder="john@example.com" />
            <FieldError />
          </TextField>
          <TextField
            name="bio"
            validate={(value) =>
              String(value).length < 10 ? "Bio must be at least 10 characters" : null
            }
          >
            <Label required>Bio</Label>
            <TextArea required placeholder="Tell us about yourself..." />
            <Description>Minimum 10 characters</Description>
            <FieldError />
          </TextField>
        </FieldGroup>
        <Fieldset.Actions>
          <Button type="submit">
            <FloppyDisk aria-hidden="true" />
            Save changes
          </Button>
          <Button type="reset" variant="secondary">
            Cancel
          </Button>
        </Fieldset.Actions>
      </Fieldset>
    </Form>
  );
}
