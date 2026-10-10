/**
 * Choice-story anatomy adapted from HeroUI v3.2.6.
 * SPDX-License-Identifier: Apache-2.0
 * Native props remain native; these fixtures only assemble labels and indicators.
 */
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Checkbox, Radio, Switch, TextField, FieldError } from "@lenso/ui";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
import { radioStyles } from "@lenso/tokens/radio";
import { descriptionStyles } from "@lenso/tokens/description";
import { labelStyles } from "@lenso/tokens/label";
import { choiceStyles as s } from "./choice.styles";

export type ChoiceLabel = React.ReactNode | ((checked: boolean) => React.ReactNode);
type Supporting = {
  label: ChoiceLabel;
  description?: ChoiceLabel;
  error?: string;
  invalid?: boolean;
  validate?: React.ComponentProps<typeof TextField>["validate"];
  card?: "addon" | "delivery" | "payment";
  icon?: React.ReactNode;
  price?: string;
};
type CheckboxItemProps = Omit<React.ComponentProps<typeof Checkbox>, "children"> &
  Supporting & {
    indicator?: "heart" | "plus" | "dash" | "cross";
    roundedSize?: "small" | "medium" | "large" | "extraLarge";
  };
const resolve = (label: ChoiceLabel | undefined, checked: boolean) =>
  typeof label === "function" ? label(checked) : label;

export function CustomCheck({ kind }: { kind: NonNullable<CheckboxItemProps["indicator"]> }) {
  return (
    <svg
      {...stylex.props(s.customIndicator)}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill={kind === "heart" ? "currentColor" : "none"}
      stroke={kind === "heart" ? undefined : "currentColor"}
      strokeWidth={kind === "heart" ? undefined : kind === "cross" ? 2 : 3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {kind === "heart" ? (
        <path d="M12.62 20.81c-.34.12-.9.12-1.24 0C8.48 19.82 2 15.69 2 8.69 2 5.6 4.49 3.1 7.56 3.1c1.82 0 3.43.88 4.44 2.24a5.53 5.53 0 0 1 4.44-2.24C19.51 3.1 22 5.6 22 8.69c0 7-6.48 11.13-9.38 12.12Z" />
      ) : kind === "plus" ? (
        <>
          <path d="M6 12H18" />
          <path d="M12 18V6" />
        </>
      ) : kind === "cross" ? (
        <path d="M6 18L18 6M6 6l12 12" />
      ) : (
        <line x1="21" x2="3" y1="12" y2="12" />
      )}
    </svg>
  );
}

export function CheckboxItem({
  label,
  description,
  error,
  invalid,
  validate,
  indicator,
  roundedSize,
  card,
  icon,
  ...props
}: CheckboxItemProps) {
  const id = React.useId();
  const control = (
    <Checkbox
      {...props}
      aria-labelledby={props["aria-label"] ? undefined : `${id}-label`}
      aria-describedby={description ? `${id}-help` : undefined}
      xstyle={[
        card && s.cardRoot,
        roundedSize === "small" && s.smallCheckmark,
        roundedSize === "extraLarge" && s.largeCheckmark,
        props.xstyle,
      ]}
      render={(nativeProps, state) => (
        <span {...nativeProps}>
          <Checkbox.Content xstyle={card && s.card}>
            <Checkbox.Control
              xstyle={[
                roundedSize && [s.rounded, s[roundedSize]],
                card && [s.cardControl, s.rounded],
              ]}
            >
              <Checkbox.Indicator xstyle={roundedSize === "extraLarge" && s.largeIndicator}>
                {indicator ? (
                  state.checked || state.indeterminate ? (
                    <CustomCheck kind={indicator} />
                  ) : null
                ) : undefined}
              </Checkbox.Indicator>
            </Checkbox.Control>
            {icon}
            <span {...stylex.props(card && s.cardText)}>
              <span id={`${id}-label`}>{resolve(label, state.checked)}</span>
              {card && description && (
                <span id={`${id}-help`} {...stylex.props(descriptionStyles.description)}>
                  {resolve(description, state.checked)}
                </span>
              )}
            </span>
          </Checkbox.Content>
          {!card && description && (
            <span
              id={`${id}-help`}
              {...stylex.props(descriptionStyles.description, checkboxSupportingStyles.direct)}
            >
              {resolve(description, state.checked)}
            </span>
          )}
          {(invalid || validate) && (
            <FieldError match={invalid ? true : undefined}>{error}</FieldError>
          )}
        </span>
      )}
    />
  );
  return invalid || validate ? (
    <TextField invalid={invalid} validate={validate} validationMode="onBlur">
      {control}
    </TextField>
  ) : (
    control
  );
}

export function RadioItem({
  label,
  description,
  error,
  invalid,
  card,
  icon,
  price,
  customIndicator,
  ...props
}: Omit<React.ComponentProps<typeof Radio>, "children"> &
  Supporting & { customIndicator?: boolean }) {
  const id = React.useId();
  const control = (
    <Radio
      {...props}
      aria-labelledby={`${id}-label`}
      aria-describedby={description || error ? `${id}-help` : undefined}
      aria-invalid={invalid || undefined}
      xstyle={[card && s.cardRoot, props.xstyle]}
      render={(nativeProps, { checked }) => (
        <span {...nativeProps}>
          <Radio.Content
            xstyle={[
              card && s.card,
              card === "delivery" && s.deliveryCard,
              card === "payment" && s.paymentCard,
            ]}
          >
            <Radio.Control xstyle={card && s.cardControl}>
              <Radio.Indicator>
                {customIndicator ? (
                  checked ? (
                    <span {...stylex.props(s.customRadio)}>✓</span>
                  ) : null
                ) : undefined}
              </Radio.Indicator>
            </Radio.Control>
            {icon}
            <span {...stylex.props(card && s.cardText)}>
              <span id={`${id}-label`}>{resolve(label, checked)}</span>
              {card && description && (
                <span id={`${id}-help`} {...stylex.props(descriptionStyles.description)}>
                  {resolve(description, checked)}
                </span>
              )}
            </span>
            {price && <span {...stylex.props(s.price)}>{price}</span>}
          </Radio.Content>
          {!card && description && (
            <span
              id={`${id}-help`}
              {...stylex.props(descriptionStyles.description, radioStyles.supporting)}
            >
              {resolve(description, checked)}
            </span>
          )}
          {error && (
            <FieldError id={`${id}-help`} match={true} xstyle={radioStyles.supporting}>
              {error}
            </FieldError>
          )}
        </span>
      )}
    />
  );
  return invalid ? <TextField invalid>{control}</TextField> : control;
}

export function SwitchItem({
  label,
  description,
  error,
  invalid,
  validate,
  before,
  thumb,
  controlStyle,
  thumbStyle,
  ...props
}: Omit<React.ComponentProps<typeof Switch>, "children"> &
  Supporting & {
    before?: boolean;
    thumb?: (checked: boolean) => React.ReactNode;
    controlStyle?:
      | React.ComponentProps<typeof Switch.Control>["xstyle"]
      | ((checked: boolean) => React.ComponentProps<typeof Switch.Control>["xstyle"]);
    thumbStyle?: React.ComponentProps<typeof Switch.Thumb>["xstyle"];
  }) {
  const id = React.useId();
  const control = (
    <Switch
      {...props}
      aria-labelledby={props["aria-label"] ? undefined : `${id}-label`}
      aria-describedby={description ? `${id}-help` : undefined}
      render={(nativeProps, { checked }) => (
        <span {...nativeProps}>
          <Switch.Content>
            {before && <span id={`${id}-label`}>{resolve(label, checked)}</span>}
            <Switch.Control
              xstyle={typeof controlStyle === "function" ? controlStyle(checked) : controlStyle}
            >
              <Switch.Thumb xstyle={thumbStyle}>{thumb?.(checked)}</Switch.Thumb>
            </Switch.Control>
            {!before && <span id={`${id}-label`}>{resolve(label, checked)}</span>}
          </Switch.Content>
          {description && (
            <span
              id={`${id}-help`}
              {...stylex.props(descriptionStyles.description, checkboxSupportingStyles.direct)}
            >
              {resolve(description, checked)}
            </span>
          )}
          {(invalid || validate) && (
            <FieldError match={invalid ? true : undefined}>{error}</FieldError>
          )}
        </span>
      )}
    />
  );
  return invalid || validate ? (
    <TextField invalid={invalid} validate={validate} validationMode="onBlur">
      {control}
    </TextField>
  ) : (
    control
  );
}

export function ChoiceHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <span id={id} {...stylex.props(labelStyles.label)}>
      {children}
    </span>
  );
}
export function ChoiceHelp({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <span id={id} {...stylex.props(descriptionStyles.description)}>
      {children}
    </span>
  );
}
