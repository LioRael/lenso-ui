"use client";
// HeroUI v3.2.6, Apache-2.0. Base Field.Error controls mounting and validation linkage.
import { Field } from "@base-ui/react/field";
import { fieldErrorStyles } from "@lenso/tokens/field-error";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
import { styledPart } from "../../utils/styled.js";
export const FieldErrorRoot = styledPart(Field.Error, "field-error", [
  fieldErrorStyles.error,
  checkboxSupportingStyles.direct,
  checkboxSupportingStyles.error,
]);
export const FieldError = Object.assign(FieldErrorRoot, { Root: FieldErrorRoot });
export type FieldErrorRootProps = React.ComponentProps<typeof FieldErrorRoot>;
export type FieldErrorProps = FieldErrorRootProps;
