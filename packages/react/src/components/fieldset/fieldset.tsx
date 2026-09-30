"use client";
// HeroUI v3.2.6, Apache-2.0.
import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";
import { fieldsetStyles } from "@lenso/tokens/fieldset";
import { styledPart } from "../../utils/styled.js";
export const FieldsetRoot = styledPart(BaseFieldset.Root, "fieldset", fieldsetStyles.root);
export const FieldsetLegend = styledPart(
  BaseFieldset.Legend,
  "fieldset-legend",
  fieldsetStyles.legend,
);
export const FieldGroup = styledPart("div", "field-group", fieldsetStyles.group);
export const FieldsetActions = styledPart("div", "fieldset-actions", fieldsetStyles.actions);
export const Fieldset = Object.assign(FieldsetRoot, {
  Root: FieldsetRoot,
  Legend: FieldsetLegend,
  Group: FieldGroup,
  Actions: FieldsetActions,
});
export type FieldsetRootProps = React.ComponentProps<typeof FieldsetRoot>;
export type FieldsetProps = FieldsetRootProps;
export type FieldsetLegendProps = React.ComponentProps<typeof FieldsetLegend>;
export type FieldGroupProps = React.ComponentProps<typeof FieldGroup>;
export type FieldsetActionsProps = React.ComponentProps<typeof FieldsetActions>;
