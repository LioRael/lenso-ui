"use client";
import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import {
  Accordion,
  Button,
  Description,
  FieldError,
  Fieldset,
  Form,
  InputGroup,
  Label,
  Select,
  Switch,
  TextArea,
  TextField,
} from "@lenso/ui";

const styles = stylex.create({
  scene: {
    boxSizing: "border-box",
    width: "100%",
    maxWidth: 520,
    minWidth: 0,
    padding: 16,
    borderRadius: 32,
    backgroundColor: "var(--lenso-background-grouped-primary)",
  },
  supporting: { paddingInline: 16, fontSize: 15, lineHeight: "20px" },
  actions: { display: "flex", flexWrap: "wrap", gap: 8 },
  status: { margin: 0, color: "var(--lenso-label-secondary)", fontSize: 15 },
});

export function GroupedForm({
  disabled = false,
  label = "Email",
  required = true,
  placeholder = "you@example.com",
}: {
  disabled?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
}) {
  const id = useId();
  const [saved, setSaved] = useState(false);
  return (
    <div {...stylex.props(styles.scene)}>
      <Form
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
        }}
        onReset={() => setSaved(false)}
        onChange={() => setSaved(false)}
      >
        <Fieldset disabled={disabled} aria-describedby={`${id}-help`}>
          <Fieldset.Legend>Profile</Fieldset.Legend>
          <Fieldset.Group>
            <TextField name="name">
              <TextField.Label>Name</TextField.Label>
              <TextField.Input placeholder="Name" defaultValue="Alex" />
            </TextField>
            <TextField name="email">
              <TextField.Label required={required}>{label}</TextField.Label>
              <InputGroup>
                <InputGroup.Input type="email" required={required} placeholder={placeholder} />
              </InputGroup>
              <FieldError />
            </TextField>
            <TextField name="notes" layout="stacked">
              <TextField.Label>Notes</TextField.Label>
              <TextArea rows={3} placeholder="Add a note" fullWidth />
            </TextField>
          </Fieldset.Group>
          <Description id={`${id}-help`} xstyle={styles.supporting}>
            Edit the profile fields. This example keeps changes in this page only.
          </Description>
        </Fieldset>
        <Fieldset disabled={disabled}>
          <Fieldset.Legend>Notifications</Fieldset.Legend>
          <Fieldset.Group>
            <Fieldset.Row>
              <Label htmlFor={`${id}-notifications`}>Receive notifications</Label>
              <Switch id={`${id}-notifications`} name="notifications" defaultChecked>
                <Switch.Content>
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Content>
              </Switch>
            </Fieldset.Row>
            <Fieldset.Row>
              <Label htmlFor={`${id}-frequency`}>Frequency</Label>
              <Select
                name="frequency"
                defaultValue="daily"
                items={[
                  { value: "daily", label: "Daily" },
                  { value: "weekly", label: "Weekly" },
                ]}
              >
                <Select.Trigger id={`${id}-frequency`}>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Content>
                  <Select.List>
                    <Select.Item value="daily">
                      <Select.ItemText>Daily</Select.ItemText>
                      <Select.ItemIndicator />
                    </Select.Item>
                    <Select.Item value="weekly">
                      <Select.ItemText>Weekly</Select.ItemText>
                      <Select.ItemIndicator />
                    </Select.Item>
                  </Select.List>
                </Select.Content>
              </Select>
            </Fieldset.Row>
            <Accordion variant="surface">
              <Accordion.Item value="advanced">
                <Accordion.Heading>
                  <Accordion.Trigger>
                    Advanced settings
                    <Accordion.Indicator />
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                  <Accordion.Body>
                    <TextField name="replyTo" layout="stacked">
                      <TextField.Label>Reply-to email</TextField.Label>
                      <TextField.Input type="email" placeholder="Optional" fullWidth />
                      <FieldError />
                    </TextField>
                  </Accordion.Body>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Fieldset.Group>
        </Fieldset>
        <div {...stylex.props(styles.actions)}>
          <Button type="submit" disabled={disabled}>
            Save changes
          </Button>
          <Button type="reset" variant="borderless" disabled={disabled}>
            Reset
          </Button>
        </div>
        <output {...stylex.props(styles.status)}>
          {saved ? "Changes saved in this example." : "Changes have not been saved."}
        </output>
      </Form>
    </div>
  );
}
