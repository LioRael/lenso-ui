"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface FieldsetStoryProps extends Pick<
  StoryComponentProps<typeof Fieldset>,
  "disabled"
> {}
export const initialArgs: FieldsetStoryProps = /* story-args:start */ {
  disabled: false,
}; /* story-args:end */

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
import { demoStyles } from "../demo.stylex";

export function Basic(overrides: FieldsetStoryProps) {
  const args = { ...initialArgs, ...overrides };
  const descriptionId = useId();
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    alert("Form submitted successfully!");
  }
  return (
    <Form xstyle={demoStyles.wideColumn} onSubmit={onSubmit}>
      <Fieldset aria-describedby={descriptionId} {...args}>
        <Fieldset.Legend>Profile Settings</Fieldset.Legend>
        <Description id={descriptionId}>Update your profile information.</Description>
        <Fieldset.Group>
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
            layout="stacked"
            validate={(value) =>
              String(value).length < 10 ? "Bio must be at least 10 characters" : null
            }
          >
            <Label required>Bio</Label>
            <TextArea required placeholder="Tell us about yourself..." />
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
