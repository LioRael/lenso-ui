// Adapted from HeroUI v3.2.6 at e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
// Apache-2.0. TextField supplies Base Field registration; NumberField keeps its native contracts.
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import * as stylex from "@stylexjs/stylex";
import {
  NumberField,
  TextField,
  Label,
  Description,
  FieldError,
  Form,
  Button,
  Spinner,
} from "@lenso/ui";
import { formWorkflowStyles as s } from "./form-workflow.stylex";

const meta = {
  component: NumberField,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Components/Forms/NumberField",
} satisfies Meta<typeof NumberField>;
export default meta;
type Story = StoryObj<typeof meta>;

const minus =
  "M6.75 11a4.25 4.25 0 1 0 0-8.5a4.25 4.25 0 0 0 0 8.5m0 1.5a5.73 5.73 0 0 0 3.501-1.188l2.719 2.718a.75.75 0 1 0 1.06-1.06l-2.718-2.719A5.75 5.75 0 1 0 6.75 12.5m-2-6.5a.75.75 0 0 0 0 1.5h4a.75.75 0 0 0 0-1.5z";
const plus =
  "M6.75 11a4.25 4.25 0 1 0 0-8.5a4.25 4.25 0 0 0 0 8.5m0 1.5a5.73 5.73 0 0 0 3.501-1.188l2.719 2.718a.75.75 0 1 0 1.06-1.06l-2.718-2.719A5.75 5.75 0 1 0 6.75 12.5m.75-7.75a.75.75 0 0 0-1.5 0V6H4.75a.75.75 0 0 0 0 1.5H6v1.25a.75.75 0 0 0 1.5 0V7.5h1.25a.75.75 0 0 0 0-1.5H7.5z";
const up =
  "M13.03 10.53a.75.75 0 0 1-1.06 0L8 6.56l-3.97 3.97a.75.75 0 1 1-1.06-1.06l4.5-4.5a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06";
const down =
  "M2.97 5.47a.75.75 0 0 1 1.06 0L8 9.44l3.97-3.97a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 0-1.06";
function Icon({ path, size = 16 }: { path: string; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 16 16">
      <path d={path} fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
    </svg>
  );
}
function Number({
  label = "Width",
  description,
  error,
  invalid = false,
  custom = false,
  chevrons = false,
  inputRef,
  ...props
}: ComponentProps<typeof NumberField> & {
  label?: string;
  description?: string;
  error?: string;
  invalid?: boolean;
  custom?: boolean;
  chevrons?: boolean;
  inputRef?: ComponentProps<typeof NumberField.Input>["ref"];
}) {
  return (
    <TextField
      name={props.name}
      disabled={props.disabled}
      invalid={invalid}
      fullWidth={props.fullWidth}
    >
      <NumberField {...props}>
        <Label required={props.required}>{label}</Label>
        <NumberField.Group xstyle={chevrons && s.chevronGroup}>
          {!chevrons && (
            <NumberField.DecrementButton>
              {custom ? <Icon path={minus} /> : undefined}
            </NumberField.DecrementButton>
          )}
          <NumberField.Input
            ref={inputRef}
            xstyle={props.fullWidth || chevrons ? s.grow : s.number}
          />
          {chevrons ? (
            <div {...stylex.props(s.chevrons)}>
              <NumberField.IncrementButton xstyle={s.chevronUp}>
                <Icon path={up} size={11} />
              </NumberField.IncrementButton>
              <NumberField.DecrementButton xstyle={s.chevronDown}>
                <Icon path={down} size={11} />
              </NumberField.DecrementButton>
            </div>
          ) : (
            <NumberField.IncrementButton>
              {custom ? <Icon path={plus} /> : undefined}
            </NumberField.IncrementButton>
          )}
        </NumberField.Group>
        {error ? (
          <FieldError match>{error}</FieldError>
        ) : (
          description && <Description>{description}</Description>
        )}
      </NumberField>
    </TextField>
  );
}
export const Default: Story = { render: () => <Number defaultValue={1024} min={0} name="width" /> };
export const Variants: Story = {
  render: () => (
    <div {...stylex.props(s.stack)}>
      <Number
        defaultValue={100}
        min={0}
        name="primary-width"
        variant="primary"
        label="Primary variant"
      />
      <Number
        defaultValue={100}
        min={0}
        name="secondary-width"
        variant="secondary"
        label="Secondary variant"
      />
    </div>
  ),
};
export const FullWidth: Story = {
  render: () => (
    <div {...stylex.props(s.full)}>
      <Number fullWidth defaultValue={1024} min={0} name="width" />
    </div>
  ),
};
export const WithDescription: Story = {
  render: () => (
    <div {...stylex.props(s.stack)}>
      <Number defaultValue={1024} min={0} name="width" description="Enter the width in pixels" />
      <Number
        defaultValue={0.5}
        format={{ style: "percent" }}
        max={1}
        min={0}
        name="percentage"
        step={0.1}
        label="Percentage"
        description="Value must be between 0 and 100"
      />
    </div>
  ),
};
export const Required: Story = {
  render: () => (
    <div {...stylex.props(s.stack)}>
      <Number required min={0} name="quantity" label="Quantity" />
      <Number
        required
        defaultValue={1}
        max={10}
        min={1}
        name="rating"
        label="Rating"
        description="Rate from 1 to 10"
      />
    </div>
  ),
};
export const Invalid: Story = {
  render: () => (
    <div {...stylex.props(s.stack)}>
      <Number
        invalid
        required
        min={0}
        name="quantity"
        value={-5}
        label="Quantity"
        error="Quantity must be greater than or equal to 0"
      />
      <Number
        invalid
        format={{ style: "percent" }}
        max={1}
        min={0}
        name="percentage"
        step={0.1}
        value={1.5}
        label="Percentage"
        error="Percentage must be between 0 and 100"
      />
    </div>
  ),
};
export const Disabled: Story = {
  render: () => (
    <div {...stylex.props(s.stack)}>
      <Number
        disabled
        defaultValue={1024}
        min={0}
        name="width"
        description="Enter the width in pixels"
      />
      <Number
        disabled
        defaultValue={0.5}
        format={{ style: "percent" }}
        max={1}
        min={0}
        name="percentage"
        step={0.1}
        label="Percentage"
        description="Value must be between 0 and 100"
      />
    </div>
  ),
};
function ControlledNumber() {
  const [value, setValue] = useState<number | null>(1024);
  return (
    <div {...stylex.props(s.stack)}>
      <Number
        min={0}
        name="width"
        value={value}
        onValueChange={setValue}
        description={`Current value: ${value}`}
      />
      <div {...stylex.props(s.row)}>
        <Button variant="tertiary" onClick={() => setValue(0)}>
          Reset to 0
        </Button>
        <Button variant="tertiary" onClick={() => setValue(2048)}>
          Set to 2048
        </Button>
      </div>
    </div>
  );
}
export const Controlled: Story = { render: () => <ControlledNumber /> };
function ValidatedNumber() {
  const [value, setValue] = useState<number | null>(null);
  // The pinned story compares the fractional percentage model against 100, not 1.
  const invalid = value !== null && (value < 0 || value > 100);
  return (
    <div {...stylex.props(s.stack)}>
      <Number
        required
        format={{ style: "percent" }}
        invalid={invalid}
        max={1}
        min={0}
        name="percentage"
        step={0.1}
        value={value}
        onValueChange={setValue}
        label="Percentage"
        error={invalid ? "Percentage must be between 0 and 100" : undefined}
        description="Enter a value between 0 and 100"
      />
    </div>
  );
}
export const WithValidation: Story = { render: () => <ValidatedNumber /> };
export const WithStep: Story = {
  render: () => (
    <div {...stylex.props(s.stack)}>
      {[1, 5, 10].map((step) => (
        <Number
          key={step}
          defaultValue={0}
          max={100}
          min={0}
          name={`step${step}`}
          step={step}
          label={`Step: ${step}`}
          description={`Increments by ${step}`}
        />
      ))}
    </div>
  ),
};
export const WithFormatOptions: Story = {
  render: () => (
    <div {...stylex.props(s.stack)}>
      <Number
        defaultValue={99}
        min={0}
        name="currency-eur"
        format={{ style: "currency", currency: "EUR", currencySign: "accounting" }}
        label="Currency (EUR - Accounting)"
        description="Accounting format with EUR currency"
      />
      <Number
        defaultValue={99.99}
        min={0}
        name="currency-usd"
        format={{ style: "currency", currency: "USD" }}
        label="Currency (USD)"
        description="Standard USD currency format"
      />
      <Number
        defaultValue={0.5}
        format={{ style: "percent" }}
        max={1}
        min={0}
        name="percentage"
        step={0.01}
        label="Percentage"
        description="Percentage format (0-1, where 0.5 = 50%)"
      />
      <Number
        defaultValue={1234.56}
        min={0}
        name="decimal"
        format={{ style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 }}
        label="Decimal (2 decimal places)"
        description="Decimal format with 2 decimal places"
      />
      <Number
        defaultValue={1000}
        min={0}
        name="unit"
        format={{ style: "unit", unit: "kilogram", unitDisplay: "short" }}
        label="Unit (Kilograms)"
        description="Unit format with kilograms"
      />
    </div>
  ),
};
export const CustomIcons: Story = {
  render: () => (
    <div {...stylex.props(s.stack)}>
      <Number
        defaultValue={1024}
        min={0}
        name="width"
        label="Width (Custom Icons)"
        custom
        description="Custom icon children"
      />
    </div>
  ),
};
export const WithChevrons: Story = {
  render: () => (
    <Number
      defaultValue={99}
      min={0}
      name="amount"
      format={{ style: "currency", currency: "EUR", currencySign: "accounting" }}
      label="Number field with chevrons"
      chevrons
    />
  ),
};
function Order({ args }: { args: ComponentProps<typeof NumberField> }) {
  const [value, setValue] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const outOfStock = value !== null && value > 3;
  return (
    <Form
      xstyle={s.form}
      onSubmit={(event) => {
        event.preventDefault();
        if (value === null || value < 1 || value > 3 || submitting) return;
        const quantity = new FormData(event.currentTarget).get("quantity");
        setSubmitting(true);
        timer.current = setTimeout(() => {
          console.log("Order submitted:", { quantity: globalThis.Number(quantity) });
          setValue(null);
          setSubmitting(false);
        }, 1500);
      }}
    >
      <Number
        {...args}
        required
        invalid={outOfStock}
        max={5}
        min={1}
        name="quantity"
        value={value}
        onValueChange={setValue}
        inputRef={ref}
        label="Order quantity"
        error={outOfStock ? "Only 3 items left in stock" : undefined}
        description="Only 3 items available"
      />
      <Button
        xstyle={s.wide}
        disabled={value === null || value < 1 || value > 3}
        isLoading={submitting}
        type="submit"
        variant="primary"
      >
        {submitting ? (
          <>
            <Spinner color="current" size="sm" />
            Processing...
          </>
        ) : (
          "Place Order"
        )}
      </Button>
    </Form>
  );
}
export const FormExample: Story = { render: (args) => <Order args={args} /> };
