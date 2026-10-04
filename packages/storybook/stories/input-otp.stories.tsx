// Adapted from HeroUI v3.2.6 at e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e (Apache-2.0).
// Story-only controls retain upstream names; actual OTP slots use native Base UI props.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useId, useRef, useState, type ComponentProps } from "react";
import * as stylex from "@stylexjs/stylex";
import { InputOTP, TextField, Label, Description, Form, Button, Link, Spinner } from "@lenso/ui";
import { formWorkflowStyles as s } from "./form-workflow.stylex";

type Args = Omit<ComponentProps<typeof InputOTP>, "length"> & {
  length?: number;
  isDisabled?: boolean;
  isInvalid?: boolean;
  maxLength?: number;
};
const meta = {
  argTypes: {
    isDisabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
    maxLength: { control: "number" },
  },
  component: Code,
  parameters: { layout: "centered" },
  title: "Components/Forms/InputOTP",
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<Args>;
function Code({
  isDisabled,
  isInvalid,
  maxLength: _sourceControl,
  length = 6,
  label = "Verify account",
  description,
  compactHeading = false,
  error,
  errorId,
  ...props
}: Args & {
  label?: string;
  description?: string;
  compactHeading?: boolean;
  error?: string;
  errorId?: string;
}) {
  const id = useId();
  return (
    <TextField
      disabled={isDisabled ?? props.disabled}
      invalid={isInvalid}
      name={props.name}
      xstyle={s.tight}
    >
      {compactHeading ? (
        <div {...stylex.props(s.heading)}>
          <Label htmlFor={id}>{label}</Label>
          <Description render={<p />} xstyle={s.muted}>
            {description}
          </Description>
        </div>
      ) : (
        <>
          <Label htmlFor={id}>{label}</Label>
          {description && <Description>{description}</Description>}
        </>
      )}
      <InputOTP
        {...props}
        disabled={isDisabled ?? props.disabled}
        length={length}
        aria-describedby={error ? errorId : props["aria-describedby"]}
      >
        <InputOTP.Group>
          {Array.from({ length: length === 4 ? 4 : 3 }, (_, index) => (
            <InputOTP.Slot key={index} id={index === 0 ? id : undefined} />
          ))}
        </InputOTP.Group>
        {length !== 4 && (
          <>
            <InputOTP.Separator />
            <InputOTP.Group>
              <InputOTP.Slot />
              <InputOTP.Slot />
              <InputOTP.Slot />
            </InputOTP.Group>
          </>
        )}
      </InputOTP>
      {error && (
        <span {...stylex.props(s.error)} data-slot="field-error" id={errorId}>
          {error}
        </span>
      )}
    </TextField>
  );
}
export const Default: Story = {
  render: (args) => (
    <div {...stylex.props(s.otp)}>
      <Code {...args} compactHeading description="We've sent a code to a****@gmail.com" />
      <div {...stylex.props(s.resend)}>
        <p {...stylex.props(s.muted)}>Didn't receive a code?</p>
        <Link xstyle={s.underline}>Resend</Link>
      </div>
    </div>
  ),
};
export const Variants: Story = {
  render: () => (
    <div {...stylex.props(s.variants)}>
      <Code label="Primary variant" variant="primary" />
      <Code label="Secondary variant" variant="secondary" />
    </div>
  ),
};
export const FourDigits: Story = {
  render: (args) => (
    <div {...stylex.props(s.otp)}>
      <Code {...args} length={4} label="Enter PIN" />
    </div>
  ),
};
export const Disabled: Story = {
  render: (args) => (
    <div {...stylex.props(s.otp)}>
      <Code {...args} isDisabled description="Code verification is currently disabled" />
    </div>
  ),
};
export const WithPattern: Story = {
  render: (args) => (
    <div {...stylex.props(s.otp)}>
      <Code
        {...args}
        label="Enter code (letters only)"
        description="Only alphabetic characters are allowed"
        validationType="alpha"
        inputMode="text"
      />
    </div>
  ),
};
function ControlledCode({ args }: { args: Args }) {
  const [value, setValue] = useState("");
  return (
    <div {...stylex.props(s.otp)}>
      <Code {...args} value={value} onValueChange={setValue} />
      <Description>
        {value ? (
          <>
            Value: {value} ({value.length}/6) •{" "}
            <button {...stylex.props(s.underline)} type="button" onClick={() => setValue("")}>
              Clear
            </button>
          </>
        ) : (
          "Enter a 6-digit code"
        )}
      </Description>
    </div>
  );
}
export const Controlled: Story = { render: (args) => <ControlledCode args={args} /> };
function ValidatedCode({ args }: { args: Args }) {
  const [value, setValue] = useState("");
  const [invalid, setInvalid] = useState(false);
  return (
    <div {...stylex.props(s.otp)}>
      <Form
        xstyle={s.tight}
        onSubmit={(event) => {
          event.preventDefault();
          const code = new FormData(event.currentTarget).get("code");
          if (code !== "123456") {
            setInvalid(true);
            return;
          }
          setInvalid(false);
          setValue("");
          alert("Code verified successfully!");
        }}
      >
        <Code
          {...args}
          name="code"
          value={value}
          isInvalid={invalid}
          onValueChange={(next) => {
            setValue(next);
            setInvalid(false);
          }}
          description="Hint: The code is 123456"
          error={invalid ? "Invalid code. Please try again." : undefined}
          errorId="code-error"
        />
        <Button disabled={value.length !== 6} type="submit">
          Submit
        </Button>
      </Form>
    </div>
  );
}
export const WithValidation: Story = { render: (args) => <ValidatedCode args={args} /> };
function AsyncCode({ args, complete = false }: { args: Args; complete?: boolean }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [isComplete, setComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return (
    <Form
      xstyle={complete ? s.otp : s.form}
      onSubmit={(event) => {
        event.preventDefault();
        if (submitting) return;
        setError("");
        if (!complete && value.length !== 6) {
          setError("Please enter all 6 digits");
          return;
        }
        setSubmitting(true);
        timer.current = setTimeout(
          () => {
            if (complete || value === "123456") {
              if (!complete) console.log("Code verified successfully!");
              setValue("");
              setComplete(false);
            } else setError("Invalid code. Please try again.");
            setSubmitting(false);
          },
          complete ? 2000 : 1500,
        );
      }}
    >
      <Code
        {...args}
        value={value}
        isInvalid={!!error}
        label={complete ? "Verify account" : "Two-factor authentication"}
        description={complete ? undefined : "Enter the 6-digit code from your authenticator app"}
        onValueChange={(next) => {
          setValue(next);
          setError("");
          setComplete(false);
        }}
        onValueComplete={(code) => {
          setComplete(true);
          if (complete) console.log("Code complete:", code);
        }}
        error={error || undefined}
        errorId="code-error"
      />
      <Button
        xstyle={complete ? s.pending : s.wide}
        disabled={complete ? !isComplete : value.length !== 6}
        isLoading={submitting}
        type="submit"
        variant="primary"
      >
        {submitting ? (
          <>
            <Spinner color="current" size="sm" />
            Verifying...
          </>
        ) : complete ? (
          "Verify Code"
        ) : (
          "Verify"
        )}
      </Button>
      {!complete && (
        <div {...stylex.props(s.backup)}>
          <p {...stylex.props(s.muted)}>Having trouble?</p>
          <Link xstyle={s.underline}>Use backup code</Link>
        </div>
      )}
    </Form>
  );
}
export const OnComplete: Story = { render: (args) => <AsyncCode args={args} complete /> };
export const FormExample: Story = { render: (args) => <AsyncCode args={args} /> };
