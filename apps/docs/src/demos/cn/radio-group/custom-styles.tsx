// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/**
 * HeroUI v3.2.6 e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
 * Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0.
 * Adapted for Base UI field/value/render contracts and StyleX.
 */
import { Field } from "@base-ui/react/field";
import { Icon } from "@iconify/react";
import {
  Button,
  Description,
  FieldError,
  Form,
  Label,
  Radio,
  RadioGroup,
  Surface,
} from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId, useState, type ComponentProps } from "react";
import { styles } from "../../en/radio-group/examples.stylex";
import { paymentIcons } from "../../en/radio-group/payment-icons";
const plans = [
  {
    value: "basic",
    label: "Basic Plan",
    description: "Includes 100 messages per month",
  },
  {
    value: "premium",
    label: "Premium Plan",
    description: "Includes 200 messages per month",
  },
  {
    value: "business",
    label: "Business Plan",
    description: "Unlimited messages",
  },
];
const subscriptions = [
  {
    value: "starter",
    label: "Starter",
    description: "For side projects and small teams",
  },
  {
    value: "pro",
    label: "Pro",
    description: "Advanced reporting and analytics",
  },
  {
    value: "teams",
    label: "Teams",
    description: "Share access with up to 10 teammates",
  },
];
type Option = (typeof plans)[number];
function PlanOptions({
  options = plans,
  customIndicator = false,
}: {
  options?: Option[];
  customIndicator?: boolean;
}) {
  const id = useId();
  return options.map((option) => (
    <Radio
      key={option.value}
      value={option.value}
      aria-label={option.label}
      aria-describedby={`${id}-${option.value}`}
    >
      <Radio.Content>
        <Radio.Control>
          {customIndicator ? (
            <Radio.Indicator
              render={(props, state) => (
                <span {...props}>
                  {state.checked ? <span {...stylex.props(styles.check)}>✓</span> : null}
                </span>
              )}
            />
          ) : (
            <Radio.Indicator />
          )}
        </Radio.Control>
        {option.label}
      </Radio.Content>
      <span id={`${id}-${option.value}`} {...stylex.props(styles.description)}>
        {option.description}
      </span>
    </Radio>
  ));
}
function PlanGroup({
  options,
  customIndicator,
  subscription = false,
  children,
  ...props
}: ComponentProps<typeof RadioGroup> & {
  options?: Option[];
  customIndicator?: boolean;
  subscription?: boolean;
}) {
  return (
    <Field.Root {...stylex.props(styles.field)}>
      <RadioGroup {...props}>
        <Label>{subscription ? "Subscription plan" : "Plan selection"}</Label>
        {!subscription && <Description>Choose the plan that suits you best</Description>}
        <PlanOptions
          options={options ?? (subscription ? subscriptions : plans)}
          customIndicator={customIndicator}
        />
        {children}
      </RadioGroup>
    </Field.Root>
  );
}
export function Basic() {
  return <PlanGroup defaultValue="premium" name="plan" />;
}
export function Controlled() {
  const [value, setValue] = useState("pro");
  return (
    <div {...stylex.props(styles.column)}>
      <PlanGroup
        subscription
        name="plan-controlled"
        value={value}
        onValueChange={(next) => setValue(String(next))}
      />
      <p {...stylex.props(styles.description)}>
        Selected plan: <span {...stylex.props(styles.medium)}>{value}</span>
      </p>
    </div>
  );
}
export function Uncontrolled() {
  const [selection, setSelection] = useState("pro");
  return (
    <div {...stylex.props(styles.column)}>
      <PlanGroup
        subscription
        defaultValue="pro"
        name="plan-uncontrolled"
        onValueChange={(next) => setSelection(String(next))}
      />
      <p {...stylex.props(styles.description)}>
        Last chosen plan: <span {...stylex.props(styles.medium)}>{selection}</span>
      </p>
    </div>
  );
}
export function Disabled() {
  return (
    <Field.Root disabled {...stylex.props(styles.field)}>
      <RadioGroup disabled defaultValue="pro" name="plan-disabled">
        <Label>Subscription plan</Label>
        <Description>Plan changes are temporarily paused while we roll out updates.</Description>
        <PlanOptions options={subscriptions} />
      </RadioGroup>
    </Field.Root>
  );
}
export function Horizontal() {
  const id = useId();
  return (
    <Field.Root {...stylex.props(styles.column)}>
      <Label id={id}>Subscription plan</Label>
      <RadioGroup
        defaultValue="pro"
        name="plan-orientation"
        aria-labelledby={id}
        aria-orientation="horizontal"
        xstyle={styles.horizontal}
      >
        <PlanOptions
          options={[
            {
              value: "starter",
              label: "Starter",
              description: "For side projects",
            },
            {
              value: "pro",
              label: "Pro",
              description: "Advanced reporting",
            },
            {
              value: "teams",
              label: "Teams",
              description: "Up to 10 teammates",
            },
          ]}
        />
      </RadioGroup>
    </Field.Root>
  );
}
export function CustomIndicator() {
  return <PlanGroup defaultValue="premium" name="plan-custom-indicator" customIndicator />;
}
export function RenderFunction() {
  return (
    <PlanGroup
      defaultValue="premium"
      name="plan-custom-render"
      render={(props) => <div {...props} data-custom="foo" />}
    />
  );
}
export function OnSurface() {
  return (
    <Surface xstyle={styles.surface}>
      <PlanGroup defaultValue="premium" name="plan-on-surface" variant="secondary" />
    </Surface>
  );
}
export function Variants() {
  return (
    <div {...stylex.props(styles.variants)}>
      {(["primary", "secondary"] as const).map((variant) => (
        <div key={variant} {...stylex.props(styles.variant)}>
          <p {...stylex.props(styles.variantLabel)}>
            {variant === "primary" ? "Primary variant" : "Secondary variant"}
          </p>
          <RadioGroup
            defaultValue="option1"
            name={`${variant}-plan`}
            variant={variant}
            aria-label={`${variant} variant`}
          >
            <PlanOptions
              options={[
                {
                  value: "option1",
                  label: "Option 1",
                  description:
                    variant === "primary"
                      ? "Standard styling with default background"
                      : "Lower emphasis variant for use in surfaces",
                },
                {
                  value: "option2",
                  label: "Option 2",
                  description: `Another option with ${variant} styling`,
                },
              ]}
            />
          </RadioGroup>
        </div>
      ))}
    </div>
  );
}
export function Validation() {
  const [message, setMessage] = useState<string | null>(null);
  return (
    <Form
      xstyle={styles.column}
      onSubmit={(event) => {
        event.preventDefault();
        setMessage(
          `Your chosen plan is: ${new FormData(event.currentTarget).get("plan-validation")}`,
        );
      }}
    >
      <PlanGroup subscription required name="plan-validation">
        <FieldError>Choose a subscription before continuing.</FieldError>
      </PlanGroup>
      <Button xstyle={styles.submit} type="submit">
        Submit
      </Button>
      {!!message && <p {...stylex.props(styles.description)}>{message}</p>}
    </Form>
  );
}
export function CustomStyles() {
  const id = useId();
  return (
    <Field.Root {...stylex.props(styles.field)}>
      <RadioGroup xstyle={styles.billing} defaultValue="yearly" name="billing" variant="secondary">
        <Label xstyle={styles.billingLabel}>计费周期</Label>
        <Description>选择你的扣费频率。</Description>
        {[
          {
            description: "每月扣费 $12",
            label: "按月",
            value: "monthly",
          },
          {
            description: "每年一次性扣费 $120",
            label: "按年",
            value: "yearly",
          },
        ].map(({ description, label, value }) => (
          <Radio
            key={value}
            value={value}
            aria-label={label}
            aria-describedby={`${id}-${value}`}
            xstyle={styles.billingRadio}
          >
            <Radio.Content xstyle={styles.billingCard}>
              <Radio.Control xstyle={styles.billingControl}>
                <Radio.Indicator
                  xstyle={styles.billingIndicator}
                  render={(props, state) => (
                    <span {...props}>
                      <span
                        {...stylex.props(
                          styles.billingDot,
                          state.checked && styles.billingDotChecked,
                        )}
                      />
                    </span>
                  )}
                />
              </Radio.Control>
              <div {...stylex.props(styles.billingText)}>
                <span {...stylex.props(styles.billingLabel)}>{label}</span>
                <span id={`${id}-${value}`} {...stylex.props(styles.billingDescription)}>
                  {description}
                </span>
              </div>
            </Radio.Content>
          </Radio>
        ))}
      </RadioGroup>
    </Field.Root>
  );
}
export function DeliveryAndPayment() {
  const id = useId();
  const deliveryOptions = [
    {
      description: "4-10 business days",
      price: "$5.00",
      title: "Standard",
      value: "standard",
    },
    {
      description: "2-5 business days",
      price: "$16.00",
      title: "Express",
      value: "express",
    },
    {
      description: "1 business day",
      price: "$25.00",
      title: "Super Fast",
      value: "super-fast",
    },
  ];
  const paymentOptions = [
    {
      description: "Exp. on 01/2026",
      title: "**** 8304",
      value: "mastercard",
    },
    {
      description: "Exp. on 01/2026",
      title: "**** 0123",
      value: "visa",
    },
    {
      description: "Pay with PayPal",
      title: "PayPal",
      value: "paypal",
    },
  ];
  return (
    <div {...stylex.props(styles.checkout)}>
      <section {...stylex.props(styles.section)}>
        <Field.Root {...stylex.props(styles.field)}>
          <RadioGroup defaultValue="express" name="delivery" variant="secondary">
            <Label>Delivery method</Label>
            <div {...stylex.props(styles.deliveryGrid)}>
              {deliveryOptions.map((option) => (
                <Radio
                  key={option.value}
                  value={option.value}
                  aria-label={option.title}
                  aria-describedby={`${id}-${option.value}`}
                >
                  <Radio.Content xstyle={styles.deliveryCard}>
                    <Radio.Control xstyle={styles.checkoutControl}>
                      <Radio.Indicator />
                    </Radio.Control>
                    <div {...stylex.props(styles.checkoutText)}>
                      <span>{option.title}</span>
                      <span id={`${id}-${option.value}`} {...stylex.props(styles.description)}>
                        {option.description}
                      </span>
                    </div>
                    <span {...stylex.props(styles.price)}>{option.price}</span>
                  </Radio.Content>
                </Radio>
              ))}
            </div>
          </RadioGroup>
        </Field.Root>
      </section>
      <section {...stylex.props(styles.section)}>
        <Field.Root {...stylex.props(styles.field)}>
          <RadioGroup defaultValue="visa" name="payment" variant="secondary">
            <div {...stylex.props(styles.paymentHeading)}>
              <Label>Payment method</Label>
            </div>
            <div {...stylex.props(styles.paymentGrid)}>
              {paymentOptions.map((option) => (
                <Radio
                  key={option.value}
                  value={option.value}
                  aria-label={option.title}
                  aria-describedby={`${id}-${option.value}`}
                >
                  <Radio.Content xstyle={styles.paymentCard}>
                    <Radio.Control xstyle={styles.checkoutControl}>
                      <Radio.Indicator />
                    </Radio.Control>
                    <PaymentIcon type={option.value} />
                    <div {...stylex.props(styles.checkoutText)}>
                      <span>{option.title}</span>
                      <span id={`${id}-${option.value}`} {...stylex.props(styles.description)}>
                        {option.description}
                      </span>
                    </div>
                  </Radio.Content>
                </Radio>
              ))}
            </div>
          </RadioGroup>
        </Field.Root>
      </section>
    </div>
  );
}
function PaymentIcon({ type }: { type: string }) {
  return (
    <Icon
      {...stylex.props(styles.icon)}
      aria-hidden="true"
      icon={
        type === "mastercard"
          ? paymentIcons.mastercard
          : type === "visa"
            ? paymentIcons.visa
            : paymentIcons.paypal
      }
    />
  );
}
