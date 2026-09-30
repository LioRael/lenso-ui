"use client";
// Adapted from HeroUI v3.2.6, e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e, Apache-2.0.
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
import * as stylex from "@stylexjs/stylex";
import { useId } from "react";

const styles = stylex.create({
  form: { width: "100%", maxWidth: 384 },
  shell: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklch, var(--border) 70%, transparent)",
    backgroundImage: {
      default: "linear-gradient(to bottom, oklch(0.985 0 0 / 0.9), white)",
      ":is([data-theme='dark'] *)":
        "linear-gradient(to bottom, oklch(0.205 0 0 / 0.8), oklch(0.205 0 0))",
    },
    padding: 16,
    boxShadow: {
      default: "0 0 0 1px rgb(0 0 0 / 0.05)",
      ":is([data-theme='dark'] *)": "0 0 0 1px rgb(255 255 255 / 0.1)",
    },
  },
  legend: {
    fontWeight: 500,
    color: { default: "oklch(0.269 0 0)", ":is([data-theme='dark'] *)": "oklch(0.97 0 0)" },
  },
  description: {
    color: { default: "oklch(0.439 0 0)", ":is([data-theme='dark'] *)": "oklch(0.708 0 0)" },
  },
  field: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklch, var(--border) 80%, transparent)",
    backgroundColor: "var(--surface)",
    boxShadow: {
      default: "0 0 0 1px rgb(0 0 0 / 0.05), 0 1px 2px rgb(0 0 0 / 0.05)",
      ":focus-visible": "0 0 0 2px oklch(0.708 0 0 / 0.25), 0 1px 2px rgb(0 0 0 / 0.05)",
      ":is([data-theme='dark'] *)": {
        default: "0 0 0 1px rgb(255 255 255 / 0.1), 0 1px 2px rgb(0 0 0 / 0.05)",
        ":focus-visible": "0 0 0 2px oklch(0.556 0 0 / 0.3), 0 1px 2px rgb(0 0 0 / 0.05)",
      },
    },
    transitionProperty: "box-shadow, border-color",
    transitionDuration: { default: "150ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
  },
});

export function CustomStyles() {
  const descriptionId = useId();
  return (
    <Form
      xstyle={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        alert("Form submitted successfully!");
      }}
    >
      <Fieldset xstyle={styles.shell} aria-describedby={descriptionId}>
        <Fieldset.Legend xstyle={styles.legend}>Profile Settings</Fieldset.Legend>
        <Description id={descriptionId} xstyle={styles.description}>
          Update your profile information.
        </Description>
        <FieldGroup>
          <TextField
            name="name"
            validate={(value) =>
              String(value).length < 3 ? "Name must be at least 3 characters" : null
            }
          >
            <Label required>Name</Label>
            <Input required xstyle={styles.field} placeholder="John Doe" />
            <FieldError />
          </TextField>
          <TextField name="email">
            <Label required>Email</Label>
            <Input required type="email" xstyle={styles.field} placeholder="john@example.com" />
            <FieldError />
          </TextField>
          <TextField
            name="bio"
            validate={(value) =>
              String(value).length < 10 ? "Bio must be at least 10 characters" : null
            }
          >
            <Label required>Bio</Label>
            <TextArea required xstyle={styles.field} placeholder="Tell us about yourself..." />
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
