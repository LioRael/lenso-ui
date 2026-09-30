"use client";
// HeroUI v3.2.6, Apache-2.0.
import { errorMessageStyles } from "@lenso/tokens/error-message";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
import { styledPart } from "../../utils/styled.js";
export const ErrorMessageRoot = styledPart("div", "error-message", [
  errorMessageStyles.error,
  checkboxSupportingStyles.direct,
  checkboxSupportingStyles.error,
]);
export const ErrorMessage = Object.assign(ErrorMessageRoot, { Root: ErrorMessageRoot });
export type ErrorMessageRootProps = React.ComponentProps<typeof ErrorMessageRoot>;
export type ErrorMessageProps = ErrorMessageRootProps;
