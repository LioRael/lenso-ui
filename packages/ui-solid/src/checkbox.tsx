/**
 * Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: Solid composition with UI SDK state and Lenso StyleX.
 */
import { checkboxStyles } from "@lenso/tokens/checkbox";
import type { JSX } from "@solidjs/web";
import * as stylex from "@stylexjs/stylex";
import {
  Checkbox as SdkCheckbox,
  CheckboxIndicator as SdkIndicator,
  type CheckboxIndicatorState,
  type CheckboxState,
} from "@ui-sdk/solid/checkbox";
import { createMemo, omit, type ComponentProps } from "solid-js";
import { styled, type StyleXProps } from "./styled.js";

export type CheckboxProps = ComponentProps<typeof SdkCheckbox> & StyleXProps;
export type CheckboxContentProps = JSX.IntrinsicElements["span"] & StyleXProps;
export type CheckboxControlProps = CheckboxContentProps & { variant?: "primary" | "secondary" };
export type CheckboxIndicatorProps = ComponentProps<typeof SdkIndicator> & StyleXProps;

function CheckboxRoot(props: CheckboxProps) {
  const compiled = createMemo(() => stylex.props(checkboxStyles.root, props.xstyle));

  return (
    <SdkCheckbox
      data-lenso-slot="checkbox"
      {...omit(props, "xstyle", "class", "style")}
      {...styled<CheckboxState>(compiled, props)}
    />
  );
}

function CheckboxContent(props: CheckboxContentProps) {
  const compiled = createMemo(() => stylex.props(checkboxStyles.content, props.xstyle));
  const presentation = styled(compiled, props);

  return (
    <span
      data-lenso-slot="checkbox-content"
      {...omit(props, "xstyle", "class", "style")}
      data-style-src={presentation["data-style-src"]}
      class={presentation.class(undefined)}
      style={presentation.style(undefined)}
    />
  );
}

function CheckboxControl(props: CheckboxControlProps) {
  const compiled = createMemo(() =>
    stylex.props(
      checkboxStyles.control,
      props.variant === "secondary" && checkboxStyles.secondary,
      props.xstyle,
    ),
  );
  const presentation = styled(compiled, props);

  return (
    <span
      data-lenso-slot="checkbox-control"
      {...omit(props, "variant", "xstyle", "class", "style")}
      data-style-src={presentation["data-style-src"]}
      class={presentation.class(undefined)}
      style={presentation.style(undefined)}
    />
  );
}

function CheckboxIndicator(props: CheckboxIndicatorProps) {
  const compiled = createMemo(() => stylex.props(checkboxStyles.indicator, props.xstyle));

  return (
    <SdkIndicator
      data-lenso-slot="checkbox-indicator"
      aria-hidden="true"
      keepMounted
      {...omit(props, "xstyle", "class", "style", "children")}
      {...styled<CheckboxIndicatorState>(compiled, props)}
    >
      {props.children ?? (
        <>
          <svg
            {...stylex.attrs(checkboxStyles.checkmark)}
            viewBox="0 0 17 18"
            fill="none"
            stroke="currentColor"
            stroke-dasharray="22"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="1 9 7 14 15 4" />
          </svg>
          <svg
            {...stylex.attrs(checkboxStyles.indeterminate)}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
          >
            <line x1="21" x2="3" y1="12" y2="12" />
          </svg>
        </>
      )}
    </SdkIndicator>
  );
}

export const Checkbox = Object.assign(CheckboxRoot, {
  Root: CheckboxRoot,
  Content: CheckboxContent,
  Control: CheckboxControl,
  Indicator: CheckboxIndicator,
});
