// Adapted from HeroUI v3.2.6 fieldset.stories.tsx (Apache-2.0).
import type { Meta, StoryObj } from "@storybook/react-vite";
import * as stylex from "@stylexjs/stylex";
import {
  Fieldset,
  Form,
  TextField,
  Label,
  Input,
  TextArea,
  Description,
  FieldError,
  Button,
} from "@lenso/ui";
import { SourceIcon } from "./source-icons";

const styles = stylex.create({ fieldset: { width: 384 } });
const meta = {
  title: "Components/Forms/Fieldset",
  component: Fieldset,
  tags: ["autodocs"],
} satisfies Meta<typeof Fieldset>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  render: () => (
    <Form
      onSubmit={(event) => {
        event.preventDefault();
        window.alert("Form submitted successfully!");
      }}
    >
      <Fieldset xstyle={styles.fieldset}>
        <Fieldset.Legend>Profile Settings</Fieldset.Legend>
        <Description>Update your profile information.</Description>
        <Fieldset.Group>
          <TextField
            name="name"
            validate={(value) =>
              typeof value === "string" && value.length < 3
                ? "Name must be at least 3 characters"
                : null
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
              typeof value === "string" && value.length < 10
                ? "Bio must be at least 10 characters"
                : null
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
            <SourceIcon name="floppy-disk" />
            Save changes
          </Button>
          <Button type="reset" variant="tertiary">
            Cancel
          </Button>
        </Fieldset.Actions>
      </Fieldset>
    </Form>
  ),
};
