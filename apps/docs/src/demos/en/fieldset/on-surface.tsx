"use client";
// Adapted from HeroUI v3.2.6, e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e, Apache-2.0.
import { FloppyDisk } from "@gravity-ui/icons";
import {
  Button,
  Description,
  FieldError,
  Fieldset,
  Form,
  Input,
  Label,
  Surface,
  TextArea,
  TextField,
} from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId } from "react";

const styles = stylex.create({
  backdrop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: "var(--surface)",
    padding: 24,
  },
  surface: { width: "100%", minWidth: 380 },
  fieldset: { width: "100%" },
});

export function OnSurface() {
  const descriptionId = useId();
  return (
    <div {...stylex.props(styles.backdrop)}>
      <Surface xstyle={styles.surface}>
        <Form
          onSubmit={(event) => {
            event.preventDefault();
            alert("Form submitted successfully!");
          }}
        >
          <Fieldset xstyle={styles.fieldset} aria-describedby={descriptionId}>
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
                <Input required placeholder="John Doe" variant="secondary" />
                <FieldError />
              </TextField>
              <TextField name="email">
                <Label required>Email</Label>
                <Input required type="email" placeholder="john@example.com" variant="secondary" />
                <FieldError />
              </TextField>
              <TextField
                name="bio"
                validate={(value) =>
                  String(value).length < 10 ? "Bio must be at least 10 characters" : null
                }
              >
                <Label required>Bio</Label>
                <TextArea required placeholder="Tell us about yourself..." variant="secondary" />
                <Description>Minimum 10 characters</Description>
                <FieldError />
              </TextField>
            </Fieldset.Group>
            <Fieldset.Actions>
              <Button type="submit">
                <FloppyDisk aria-hidden="true" />
                Save changes
              </Button>
              <Button type="reset" variant="tertiary">
                Cancel
              </Button>
            </Fieldset.Actions>
          </Fieldset>
        </Form>
      </Surface>
    </div>
  );
}
