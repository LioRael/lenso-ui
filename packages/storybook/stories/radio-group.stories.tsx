// Adapted from HeroUI v3.2.6 e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
// SPDX-License-Identifier: Apache-2.0. See ../CHOICE-EVIDENCE.md.
import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { RadioGroup, Button, Form, TextField, FieldError } from "@lenso/ui";
import { RadioItem, ChoiceHeading, ChoiceHelp } from "./choice-fixtures";
import { PaymentIcon } from "./choice-icons";
import { choiceStyles as s } from "./choice.styles";

const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  argTypes: {},
  parameters: { layout: "centered" },
} satisfies Meta<typeof RadioGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
const plans = [
  { value: "basic", label: "Basic Plan", description: "Includes 100 messages per month" },
  { value: "premium", label: "Premium Plan", description: "Includes 200 messages per month" },
  { value: "business", label: "Business Plan", description: "Unlimited messages" },
];
const subscriptions = [
  { value: "starter", label: "Starter", description: "For side projects and small teams" },
  { value: "pro", label: "Pro", description: "Advanced reporting and analytics" },
  { value: "teams", label: "Teams", description: "Share access with up to 10 teammates" },
];
function PlanChoices({ custom = false }: { custom?: boolean }) {
  return plans.map((plan) => <RadioItem key={plan.value} {...plan} customIndicator={custom} />);
}
function SubscriptionChoices() {
  return subscriptions.map((plan) => <RadioItem key={plan.value} {...plan} />);
}
export const Default: Story = {
  render: function PlanSelection() {
    const id = React.useId();
    return (
      <div {...stylex.props(s.padded)}>
        <RadioGroup
          defaultValue="premium"
          name="plan"
          aria-labelledby={`${id}-label`}
          aria-describedby={`${id}-help`}
        >
          <ChoiceHeading id={`${id}-label`}>Plan selection</ChoiceHeading>
          <ChoiceHelp id={`${id}-help`}>Choose the plan that suits you best</ChoiceHelp>
          <PlanChoices />
        </RadioGroup>
      </div>
    );
  },
};
export const Variants: Story = {
  render: () => (
    <div {...stylex.props(s.variantsColumn, s.padded)}>
      <div {...stylex.props(s.compact)}>
        <p {...stylex.props(s.heading)}>Primary variant</p>
        <RadioGroup
          defaultValue="option1"
          name="primary-plan"
          variant="primary"
          aria-label="Primary variant"
        >
          <RadioItem
            value="option1"
            label="Option 1"
            description="Standard styling with default background"
          />
          <RadioItem
            value="option2"
            label="Option 2"
            description="Another option with primary styling"
          />
        </RadioGroup>
      </div>
      <div {...stylex.props(s.compact)}>
        <p {...stylex.props(s.heading)}>Secondary variant</p>
        <RadioGroup
          defaultValue="option1"
          name="secondary-plan"
          variant="secondary"
          aria-label="Secondary variant"
        >
          <RadioItem
            value="option1"
            label="Option 1"
            description="Lower emphasis variant for use in surfaces"
          />
          <RadioItem
            value="option2"
            label="Option 2"
            description="Another option with secondary styling"
          />
        </RadioGroup>
      </div>
    </div>
  ),
};
export const PerRadioInvalid: Story = {
  render: function PerRadioError() {
    const id = React.useId();
    return (
      <div {...stylex.props(s.padded)}>
        <RadioGroup defaultValue="premium" name="plan-invalid" aria-labelledby={id}>
          <ChoiceHeading id={id}>Plan selection</ChoiceHeading>
          <RadioItem
            invalid
            aria-required="true"
            value="basic"
            label="Basic Plan"
            error="This plan is not available for your account"
          />
          <RadioItem
            value="premium"
            label="Premium Plan"
            description="Includes 200 messages per month"
          />
        </RadioGroup>
      </div>
    );
  },
};
export const WithCustomIndicator: Story = {
  render: function CustomPlanIndicator() {
    const id = React.useId();
    return (
      <div {...stylex.props(s.padded)}>
        <RadioGroup
          defaultValue="premium"
          name="plan-custom-indicator"
          aria-labelledby={`${id}-label`}
          aria-describedby={`${id}-help`}
        >
          <ChoiceHeading id={`${id}-label`}>Plan selection</ChoiceHeading>
          <ChoiceHelp id={`${id}-help`}>Choose the plan that suits you best</ChoiceHelp>
          <PlanChoices custom />
        </RadioGroup>
      </div>
    );
  },
};
export const Orientation: Story = {
  render: function HorizontalPlans() {
    const id = React.useId();
    return (
      <div {...stylex.props(s.column, s.padded)}>
        <ChoiceHeading id={id}>Subscription plan</ChoiceHeading>
        <RadioGroup
          defaultValue="pro"
          name="plan-orientation"
          aria-labelledby={id}
          aria-orientation="horizontal"
        >
          <SubscriptionChoices />
        </RadioGroup>
      </div>
    );
  },
};
export const Validation: Story = {
  render: function SubscriptionForm() {
    const id = React.useId();
    return (
      <Form
        xstyle={[s.column, s.padded]}
        onSubmit={(event) => {
          event.preventDefault();
          alert(`Your chosen plan is: ${new FormData(event.currentTarget).get("plan-validation")}`);
        }}
      >
        <TextField name="plan-validation">
          <RadioGroup required name="plan-validation" aria-labelledby={id}>
            <ChoiceHeading id={id}>Subscription plan</ChoiceHeading>
            <SubscriptionChoices />
            <FieldError>Choose a subscription before continuing.</FieldError>
          </RadioGroup>
        </TextField>
        <Button type="submit">Submit</Button>
      </Form>
    );
  },
};
export const Controlled: Story = {
  render: function ControlledPlans() {
    const id = React.useId();
    const [value, setValue] = React.useState("pro");
    return (
      <div {...stylex.props(s.controlledColumn, s.padded)}>
        <RadioGroup
          name="plan-controlled"
          value={value}
          onValueChange={setValue}
          aria-labelledby={id}
        >
          <ChoiceHeading id={id}>Subscription plan</ChoiceHeading>
          <SubscriptionChoices />
        </RadioGroup>
        <p {...stylex.props(s.status)}>
          Selected plan: <strong>{value}</strong>
        </p>
      </div>
    );
  },
};
export const Uncontrolled: Story = {
  render: function UncontrolledPlans() {
    const id = React.useId();
    const [selection, setSelection] = React.useState("pro");
    return (
      <div {...stylex.props(s.controlledColumn, s.padded)}>
        <RadioGroup
          defaultValue="pro"
          name="plan-uncontrolled"
          onValueChange={(value) => setSelection(String(value))}
          aria-labelledby={id}
        >
          <ChoiceHeading id={id}>Subscription plan</ChoiceHeading>
          <SubscriptionChoices />
        </RadioGroup>
        <p {...stylex.props(s.status)}>
          Last chosen plan: <strong>{selection}</strong>
        </p>
      </div>
    );
  },
};
export const Disabled: Story = {
  render: function DisabledPlans() {
    const id = React.useId();
    return (
      <div {...stylex.props(s.padded)}>
        <RadioGroup
          disabled
          defaultValue="pro"
          name="plan-disabled"
          aria-labelledby={`${id}-label`}
          aria-describedby={`${id}-help`}
        >
          <ChoiceHeading id={`${id}-label`}>Subscription plan</ChoiceHeading>
          <ChoiceHelp id={`${id}-help`}>
            Plan changes are temporarily paused while we roll out updates.
          </ChoiceHelp>
          <SubscriptionChoices />
        </RadioGroup>
      </div>
    );
  },
};
export const DeliveryAndPaymentExample: Story = {
  render: function DeliveryAndPayment() {
    const id = React.useId();
    const deliveryOptions = [
      { description: "4-10 business days", price: "$5.00", value: "standard", label: "Standard" },
      { description: "2-5 business days", price: "$16.00", value: "express", label: "Express" },
      { description: "1 business day", price: "$25.00", value: "super-fast", label: "Super Fast" },
    ];
    const paymentOptions = [
      { label: "**** 8304", value: "mastercard", description: "Exp. on 01/2026" },
      { label: "**** 0123", value: "visa", description: "Exp. on 01/2026" },
      { label: "PayPal", value: "paypal", description: "Pay with PayPal" },
    ] as const;
    return (
      <div {...stylex.props(s.showcase)}>
        <section {...stylex.props(s.section)}>
          <RadioGroup defaultValue="express" name="delivery" aria-labelledby={`${id}-delivery`}>
            <ChoiceHeading id={`${id}-delivery`}>Delivery method</ChoiceHeading>
            <div {...stylex.props(s.deliveryGrid)}>
              {deliveryOptions.map((option) => (
                <RadioItem key={option.value} {...option} card="delivery" />
              ))}
            </div>
          </RadioGroup>
        </section>
        <section {...stylex.props(s.section)}>
          <RadioGroup defaultValue="visa" name="payment" aria-labelledby={`${id}-payment`}>
            <ChoiceHeading id={`${id}-payment`}>Payment method</ChoiceHeading>
            <div {...stylex.props(s.paymentGrid)}>
              {paymentOptions.map((option) => (
                <RadioItem
                  key={option.value}
                  {...option}
                  card="payment"
                  icon={<PaymentIcon name={option.value} {...stylex.props(s.paymentIcon)} />}
                />
              ))}
            </div>
          </RadioGroup>
        </section>
      </div>
    );
  },
};
