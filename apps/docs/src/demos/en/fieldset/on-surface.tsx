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
    backgroundColor: "var(--lenso-background-grouped-secondary)",
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
              <TextField name="name">
                <Label required>Name</Label>
                <Input
                  required
                  placeholder="John Doe"
                  variant="secondary"
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
                <Input required type="email" placeholder="john@example.com" variant="secondary" />
                <FieldError />
              </TextField>
              <TextField name="bio">
                <Label required>Bio</Label>
                <TextArea
                  required
                  placeholder="Tell us about yourself..."
                  variant="secondary"
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
      </Surface>
    </div>
  );
}
