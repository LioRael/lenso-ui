"use client";
// HeroUI v3.2.6, Apache-2.0.
import { errorMessageStyles } from "@lenso/tokens/error-message";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
import * as stylex from "@stylexjs/stylex";
import { type StyleXProps } from "../../utils/styled.js";
const supportingStyles = [
  errorMessageStyles.error,
  checkboxSupportingStyles.direct,
  checkboxSupportingStyles.error,
];
export function ErrorMessageRoot({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(supportingStyles, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={slot ?? "error-message"}
    />
  );
}
export const ErrorMessage = Object.assign(ErrorMessageRoot, { Root: ErrorMessageRoot });
export type ErrorMessageRootProps = React.ComponentProps<typeof ErrorMessageRoot>;
export type ErrorMessageProps = ErrorMessageRootProps;
