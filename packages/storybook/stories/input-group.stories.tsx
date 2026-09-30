// Adapted from HeroUI v3.2.6 input-group.stories.tsx (Apache-2.0).
// Native controls own defaultValue/type/required; Tooltip uses explicit Base UI composition.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import {
  InputGroup,
  TextField,
  Label,
  Description,
  FieldError,
  Button,
  Chip,
  Kbd,
  Spinner,
  Tooltip,
} from "@lenso/ui";
import { SourceIcon } from "./source-icons";

const styles = stylex.create({
  field: { width: 280 },
  input: { width: 280 },
  price: { width: 200 },
  icon: { width: 16, height: 16 },
  muted: { color: "var(--muted)" },
  stack: { display: "flex", flexDirection: "column", gap: 16 },
  variations: { display: "flex", flexDirection: "column", gap: 24 },
  full: { width: 400 },
  end: { paddingInlineEnd: 0 },
  inset: { paddingInlineEnd: 8 },
  compactCopy: { height: "auto", padding: 0 },
  composer: {
    display: "flex",
    width: { default: 384, "@media (min-width: 640px)": 512 },
    flexDirection: "column",
  },
  composerGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    borderRadius: 24,
    paddingBlock: 8,
  },
  composerPrefix: { paddingInline: 12, paddingBlock: 0 },
  textarea: { width: "100%", resize: "none", paddingInline: 14, paddingBlock: 0 },
  composerSuffix: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    gap: 6,
    paddingInline: 12,
    paddingBlock: 0,
  },
  sendControls: { marginInlineStart: "auto", display: "flex", alignItems: "center", gap: 6 },
  tooltipText: { fontSize: 12 },
  sendTooltip: { display: "flex", alignItems: "center", gap: 4 },
  enter: { height: 16, borderRadius: 4, paddingInline: 4 },
});
const meta = {
  title: "Components/Forms/InputGroup",
  component: InputGroup,
  tags: ["autodocs"],
} satisfies Meta<typeof InputGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
function Email({
  name = "email",
  label = "Email address",
  prefix = true,
  suffix = false,
  required = false,
  invalid = false,
  disabled = false,
  description,
  value,
}: {
  name?: string;
  label?: string;
  prefix?: boolean;
  suffix?: boolean;
  required?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  description?: string;
  value?: string;
}) {
  return (
    <TextField name={name} disabled={disabled} invalid={invalid} xstyle={styles.field}>
      <Label required={required}>{label}</Label>
      <InputGroup>
        {prefix && (
          <InputGroup.Prefix>
            <SourceIcon name="envelope" {...stylex.props(styles.icon, styles.muted)} />
          </InputGroup.Prefix>
        )}
        <InputGroup.Input
          required={required}
          defaultValue={value}
          xstyle={styles.input}
          placeholder={disabled ? undefined : "name@email.com"}
        />
        {suffix && (
          <InputGroup.Suffix>
            <SourceIcon name="envelope" {...stylex.props(styles.icon, styles.muted)} />
          </InputGroup.Suffix>
        )}
      </InputGroup>
      {description && <Description>{description}</Description>}
      {invalid && <FieldError match>Please enter a valid email address</FieldError>}
    </TextField>
  );
}
function Price({
  required = false,
  invalid = false,
  disabled = false,
  value,
  constrained = true,
  placeholder,
}: {
  required?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  value?: string;
  constrained?: boolean;
  placeholder?: string;
}) {
  return (
    <TextField
      name="price"
      invalid={invalid}
      disabled={disabled}
      xstyle={constrained && styles.field}
    >
      <Label required={required}>Set a price</Label>
      <InputGroup>
        <InputGroup.Prefix>$</InputGroup.Prefix>
        <InputGroup.Input
          required={required}
          defaultValue={value}
          xstyle={styles.price}
          type="number"
          placeholder={placeholder}
        />
        <InputGroup.Suffix>USD</InputGroup.Suffix>
      </InputGroup>
      {invalid ? (
        <FieldError match>Price must be greater than 0</FieldError>
      ) : (
        !disabled && <Description>What customers would pay</Description>
      )}
    </TextField>
  );
}
function Website({
  name = "website",
  value,
  prefix,
  suffix,
  compactCopy = false,
}: {
  name?: string;
  value: string;
  prefix?: "https://" | "globe";
  suffix?: ".com" | "copy";
  compactCopy?: boolean;
}) {
  return (
    <TextField name={name} xstyle={styles.field}>
      <Label>Website</Label>
      <InputGroup>
        {prefix && (
          <InputGroup.Prefix>
            {prefix === "globe" ? (
              <SourceIcon name="globe" {...stylex.props(styles.icon, styles.muted)} />
            ) : (
              prefix
            )}
          </InputGroup.Prefix>
        )}
        <InputGroup.Input defaultValue={value} xstyle={styles.input} />
        {suffix && (
          <InputGroup.Suffix xstyle={suffix === "copy" && styles.end}>
            {suffix === "copy" ? (
              <Button
                isIconOnly
                aria-label="Copy"
                size="sm"
                variant="ghost"
                xstyle={compactCopy && styles.compactCopy}
              >
                <SourceIcon name="copy" {...stylex.props(styles.icon)} />
              </Button>
            ) : (
              suffix
            )}
          </InputGroup.Suffix>
        )}
      </InputGroup>
    </TextField>
  );
}
export const Default: Story = { render: () => <Email /> };
export const Variants: Story = {
  render: () => (
    <div {...stylex.props(styles.stack)}>
      {(["primary", "secondary"] as const).map((variant) => (
        <TextField key={variant} name={variant} xstyle={styles.field}>
          <Label>{variant === "primary" ? "Primary variant" : "Secondary variant"}</Label>
          <InputGroup variant={variant}>
            <InputGroup.Prefix>
              <SourceIcon name="envelope" {...stylex.props(styles.icon, styles.muted)} />
            </InputGroup.Prefix>
            <InputGroup.Input placeholder="name@email.com" />
          </InputGroup>
        </TextField>
      ))}
    </div>
  ),
};
export const FullWidth: Story = {
  render: () => (
    <div {...stylex.props(styles.full, styles.stack)}>
      <TextField fullWidth name="email">
        <Label>Email address</Label>
        <InputGroup fullWidth>
          <InputGroup.Prefix>
            <SourceIcon name="envelope" {...stylex.props(styles.icon, styles.muted)} />
          </InputGroup.Prefix>
          <InputGroup.Input placeholder="name@email.com" />
        </InputGroup>
      </TextField>
      <TextField fullWidth name="password">
        <Label>Password</Label>
        <InputGroup fullWidth>
          <InputGroup.Input placeholder="Enter password" type="password" />
          <InputGroup.Suffix>
            <SourceIcon name="eye" {...stylex.props(styles.icon, styles.muted)} />
          </InputGroup.Suffix>
        </InputGroup>
      </TextField>
    </div>
  ),
};
export const WithPrefixIcon: Story = {
  render: () => <Email description="We'll never share this with anyone else" />,
};
export const WithSuffixIcon: Story = {
  render: () => <Email prefix={false} suffix description="We don't send spam" />,
};
export const WithPrefixAndSuffix: Story = { render: () => <Price value="10" /> };
export const WithTextPrefix: Story = {
  render: () => <Website value="heroui.com" prefix="https://" />,
};
export const WithTextSuffix: Story = { render: () => <Website value="heroui" suffix=".com" /> };
export const WithIconPrefixAndTextSuffix: Story = {
  render: () => <Website value="heroui" prefix="globe" suffix=".com" />,
};
export const WithCopySuffix: Story = { render: () => <Website value="heroui.com" suffix="copy" /> };
export const WithIconPrefixAndCopySuffix: Story = {
  render: () => <Website value="heroui.com" prefix="globe" suffix="copy" />,
};
function Password() {
  const [visible, setVisible] = useState(false);
  return (
    <TextField name="password" xstyle={styles.field}>
      <Label>Password</Label>
      <InputGroup>
        <InputGroup.Input
          xstyle={styles.input}
          type={visible ? "text" : "password"}
          value={visible ? "87$2h.3diua" : "••••••••"}
        />
        <InputGroup.Suffix xstyle={styles.end}>
          <Button
            isIconOnly
            aria-label={visible ? "Hide password" : "Show password"}
            size="sm"
            variant="ghost"
            onClick={() => setVisible(!visible)}
          >
            <SourceIcon name={visible ? "eye" : "eye-slash"} {...stylex.props(styles.icon)} />
          </Button>
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}
export const PasswordWithToggle: Story = { render: () => <Password /> };
export const WithLoadingSuffix: Story = {
  render: () => (
    <TextField name="status" xstyle={styles.field}>
      <InputGroup>
        <InputGroup.Input aria-label="Status" defaultValue="Sending..." xstyle={styles.input} />
        <InputGroup.Suffix>
          <Spinner xstyle={styles.icon} />
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  ),
};
export const WithKeyboardShortcut: Story = {
  render: () => (
    <TextField name="command" xstyle={styles.field}>
      <InputGroup>
        <InputGroup.Input aria-label="Command" xstyle={styles.input} placeholder="Command" />
        <InputGroup.Suffix xstyle={styles.inset}>
          <Kbd>
            <Kbd.Abbr keyValue="command" />
            <Kbd.Content>K</Kbd.Content>
          </Kbd>
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  ),
};
export const WithBadgeSuffix: Story = {
  render: () => (
    <TextField name="email" xstyle={styles.field}>
      <InputGroup>
        <InputGroup.Input
          aria-label="Email address"
          xstyle={styles.input}
          placeholder="Email address"
        />
        <InputGroup.Suffix xstyle={styles.inset}>
          <Chip color="accent" size="md" variant="soft">
            Pro
          </Chip>
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  ),
};
export const Required: Story = {
  render: () => (
    <div {...stylex.props(styles.stack)}>
      <Email required />
      <Price required constrained={false} placeholder="0" />
    </div>
  ),
};
export const Invalid: Story = {
  render: () => (
    <div {...stylex.props(styles.stack)}>
      <Email required invalid />
      <Price required invalid placeholder="0" />
    </div>
  ),
};
export const Disabled: Story = {
  render: () => (
    <div {...stylex.props(styles.stack)}>
      <Email disabled value="name@email.com" />
      <Price disabled value="10" />
    </div>
  ),
};
function Hint({
  button,
  children,
  send = false,
}: {
  button: ReactElement;
  children: ReactNode;
  send?: boolean;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger delay={0} render={button} />
      <Tooltip.Portal>
        <Tooltip.Positioner>
          <Tooltip.Popup xstyle={send && styles.sendTooltip}>{children}</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
function Composer() {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function submit() {
    if (!value.trim()) return;
    setSubmitting(true);
    timer.current = setTimeout(() => {
      setSubmitting(false);
      setValue("");
    }, 1000);
  }
  return (
    <Tooltip.Provider>
      <TextField fullWidth name="prompt" xstyle={styles.composer}>
        <InputGroup fullWidth xstyle={styles.composerGroup}>
          <InputGroup.Prefix xstyle={styles.composerPrefix}>
            <Button aria-label="Add context" size="sm" variant="outline">
              <SourceIcon name="at" />
              Add Context
            </Button>
          </InputGroup.Prefix>
          <InputGroup.TextArea
            aria-label="Prompt input"
            xstyle={styles.textarea}
            placeholder="Assign tasks or ask anything..."
            rows={5}
            value={value}
            onValueChange={setValue}
          />
          <InputGroup.Suffix xstyle={styles.composerSuffix}>
            <Hint
              button={
                <Button isIconOnly aria-label="Attach file" size="sm" variant="tertiary">
                  <SourceIcon name="plus" />
                </Button>
              }
            >
              <p {...stylex.props(styles.tooltipText)}>Add a files and more</p>
            </Hint>
            <Hint
              button={
                <Button isIconOnly aria-label="Connect Apps" size="sm" variant="tertiary">
                  <SourceIcon name="plug-connection" />
                </Button>
              }
            >
              <p {...stylex.props(styles.tooltipText)}>Connect apps</p>
            </Hint>
            <div {...stylex.props(styles.sendControls)}>
              <Hint
                button={
                  <Button isIconOnly aria-label="Voice input" size="sm" variant="ghost">
                    <SourceIcon name="microphone" />
                  </Button>
                }
              >
                <p {...stylex.props(styles.tooltipText)}>Voice input</p>
              </Hint>
              <Hint
                send
                button={
                  <Button
                    isIconOnly
                    aria-label="Send prompt"
                    disabled={!value.trim()}
                    isLoading={submitting}
                    onClick={submit}
                  >
                    {submitting ? (
                      <Spinner color="current" size="sm" />
                    ) : (
                      <SourceIcon name="arrow-up" />
                    )}
                  </Button>
                }
              >
                <p {...stylex.props(styles.tooltipText)}>Send</p>
                <Kbd xstyle={styles.enter}>
                  <Kbd.Abbr keyValue="enter" />
                </Kbd>
              </Hint>
            </div>
          </InputGroup.Suffix>
        </InputGroup>
      </TextField>
    </Tooltip.Provider>
  );
}
export const WithTextArea: Story = { render: () => <Composer /> };
export const AllVariations: Story = {
  render: () => (
    <div {...stylex.props(styles.variations)}>
      <div {...stylex.props(styles.stack)}>
        <Email
          name="email1"
          label="Email address *"
          description="We'll never share this with anyone else"
        />
        <Email
          name="email2"
          label="Email address *"
          prefix={false}
          suffix
          description="We don't send spam"
        />
        <Price value="10" />
        <Website name="website1" value="heroui.com" prefix="https://" />
        <Website name="website2" value="heroui" suffix=".com" />
        <Website name="website3" value="heroui" prefix="globe" suffix=".com" />
        <Website name="website4" value="heroui.com" suffix="copy" compactCopy />
        <Website name="website5" value="heroui.com" prefix="globe" suffix="copy" compactCopy />
      </div>
    </div>
  ),
};
