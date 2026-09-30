// Adapted from HeroUI v3.2.6 textfield.stories.tsx (Apache-2.0).
// Field.Root owns validity; native Input/TextArea own type, required and controlled values.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { TextField, Label, Input, TextArea, Description, FieldError } from "@lenso/ui";

const styles = stylex.create({
  stack: { display: "flex", flexDirection: "column", gap: 16 },
  full: { width: 400 },
  types: { width: 320 },
  control: { width: 280 },
  resize: { resize: "vertical" },
});
const meta = {
  title: "Components/Forms/TextField",
  component: TextField,
  tags: ["autodocs"],
} satisfies Meta<typeof TextField>;
export default meta;
type Story = StoryObj<typeof meta>;
function Stack({ children }: { children: ReactNode }) {
  return <div {...stylex.props(styles.stack)}>{children}</div>;
}
export const Default: Story = {
  render: () => (
    <TextField name="name">
      <Label>Your name</Label>
      <Input xstyle={styles.control} placeholder="John" />
    </TextField>
  ),
};
export const FullWidth: Story = {
  render: () => (
    <div {...stylex.props(styles.stack, styles.full)}>
      <TextField fullWidth name="name">
        <Label>Your name</Label>
        <Input placeholder="John" />
      </TextField>
      <TextField fullWidth name="productDescription">
        <Label>Describe your product</Label>
        <TextArea placeholder="My product is..." />
      </TextField>
      <TextField fullWidth invalid name="password">
        <Label required>Password</Label>
        <Input required type="password" />
        <FieldError match>Password must be longer than 8 characters</FieldError>
      </TextField>
    </div>
  ),
};
export const WithTextArea: Story = {
  render: () => (
    <Stack>
      <TextField name="productDescription">
        <Label>Describe your product</Label>
        <TextArea xstyle={styles.control} placeholder="My product is..." />
      </TextField>
      <TextField name="detailedDescription">
        <Label>Detailed description</Label>
        <TextArea xstyle={styles.control} placeholder="Provide more details..." rows={4} />
        <Description>Minimum 4 rows</Description>
      </TextField>
      <TextField name="review">
        <Label>Review</Label>
        <TextArea
          xstyle={[styles.control, styles.resize]}
          placeholder="Share your experience..."
          rows={6}
        />
        <Description>Resizable vertically</Description>
      </TextField>
    </Stack>
  ),
};
export const Required: Story = {
  render: () => (
    <Stack>
      <TextField name="email">
        <Label required>Email</Label>
        <Input required type="email" xstyle={styles.control} placeholder="john@example.com" />
      </TextField>
      <TextField name="address">
        <Label required>Delivery address</Label>
        <TextArea required xstyle={styles.control} placeholder="123 Main St, Anytown, USA" />
        <Description>Make sure to include the zip code</Description>
      </TextField>
    </Stack>
  ),
};
export const WithDescription: Story = {
  render: () => (
    <Stack>
      <TextField name="name">
        <Label>Your name</Label>
        <Input xstyle={styles.control} placeholder="John" />
        <Description>We'll never share this with anyone else</Description>
      </TextField>
      <TextField name="address">
        <Label>Delivery address</Label>
        <TextArea xstyle={styles.control} placeholder="123 Main St, Anytown, USA" />
        <Description>Make sure to include the zip code</Description>
      </TextField>
    </Stack>
  ),
};
export const Invalid: Story = {
  render: () => (
    <Stack>
      <TextField invalid name="password">
        <Label required>Your password</Label>
        <Input required type="password" xstyle={styles.control} />
        <FieldError match>Password must be longer than 8 characters</FieldError>
      </TextField>
      <TextField invalid name="address">
        <Label required>Delivery address</Label>
        <TextArea required xstyle={styles.control} placeholder="123 Main St, Anytown, USA" />
        <FieldError match>The address is invalid</FieldError>
      </TextField>
    </Stack>
  ),
};
export const Disabled: Story = {
  render: () => (
    <Stack>
      <TextField disabled name="name">
        <Label>Your name</Label>
        <Input xstyle={styles.control} placeholder="John" />
        <Description>We'll never share this with anyone else</Description>
      </TextField>
      <TextField disabled name="message">
        <Label>Your message</Label>
        <TextArea xstyle={styles.control} placeholder="Tell us more about yourself..." />
        <Description>Min 50 characters</Description>
      </TextField>
    </Stack>
  ),
};
export const InputTypes: Story = {
  render: () => (
    <div {...stylex.props(styles.stack, styles.types)}>
      <TextField name="age">
        <Label>Your age</Label>
        <Input type="number" xstyle={styles.control} placeholder="18" />
      </TextField>
      <TextField name="password">
        <Label>Your password</Label>
        <Input type="password" xstyle={styles.control} placeholder="••••••••" />
      </TextField>
      <TextField name="email">
        <Label>Your email</Label>
        <Input type="email" xstyle={styles.control} placeholder="john@example.com" />
      </TextField>
    </div>
  ),
};
function ControlledFields() {
  const [input, setInput] = useState("");
  const [textarea, setTextarea] = useState("");
  return (
    <Stack>
      <TextField name="name">
        <Label>Your name</Label>
        <Input value={input} onValueChange={setInput} xstyle={styles.control} placeholder="John" />
        <Description>Character count: {input.length}</Description>
      </TextField>
      <TextField name="bio">
        <Label>Your bio</Label>
        <TextArea
          value={textarea}
          onValueChange={setTextarea}
          xstyle={styles.control}
          placeholder="Tell us about yourself..."
        />
        <Description>Character count: {textarea.length} / 500</Description>
      </TextField>
    </Stack>
  );
}
export const Controlled: Story = { render: () => <ControlledFields /> };
function ValidatedFields() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const invalidUsername = username.length > 0 && username.length < 3;
  const invalidBio = bio.length > 0 && bio.length < 20;
  return (
    <Stack>
      <TextField invalid={invalidUsername} name="username">
        <Label required>Username</Label>
        <Input
          required
          value={username}
          onValueChange={setUsername}
          xstyle={styles.control}
          placeholder="john_doe"
        />
        {invalidUsername ? (
          <FieldError match>Username must be at least 3 characters</FieldError>
        ) : (
          <Description>Choose a unique username</Description>
        )}
      </TextField>
      <TextField invalid={invalidBio} name="bio">
        <Label required>Bio</Label>
        <TextArea
          required
          value={bio}
          onValueChange={setBio}
          xstyle={styles.control}
          placeholder="Tell us about yourself..."
        />
        {invalidBio ? (
          <FieldError match>Bio must be at least 20 characters</FieldError>
        ) : (
          <Description>Min 20 characters ({bio.length}/20)</Description>
        )}
      </TextField>
    </Stack>
  );
}
export const WithValidation: Story = { render: () => <ValidatedFields /> };
