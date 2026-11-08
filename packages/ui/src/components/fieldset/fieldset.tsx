"use client";
import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";
import { Field } from "@base-ui/react/field";
import { fieldsetStyles } from "@lenso/tokens/fieldset";
import { groupStyles } from "@lenso/tokens/surface";
import { FieldGroupContext } from "../textfield/group-context.js";
import { FieldScope } from "../textfield/field-scope.js";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
export function FieldsetRoot({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<Omit<BaseFieldset.Root.Props, "ref"> & React.RefAttributes<HTMLElement>> & {
  "data-slot"?: unknown;
}) {
  const compiled = stylex.props(fieldsetStyles.root, xstyle);
  return (
    <FieldGroupContext value={false}>
      <FieldScope value={false}>
        <BaseFieldset.Root
          {...props}
          {...compiled}
          style={mergeStyle<BaseFieldset.Root.State>(compiled.style, style)}
          data-slot={slot ?? "fieldset"}
        />
      </FieldScope>
    </FieldGroupContext>
  );
}
export function FieldsetLegend({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseFieldset.Legend.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(fieldsetStyles.legend, xstyle);
  return (
    <BaseFieldset.Legend
      {...props}
      {...compiled}
      style={mergeStyle<BaseFieldset.Legend.State>(compiled.style, style)}
      data-slot={slot ?? "fieldset-legend"}
    />
  );
}
export function FieldsetGroup({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(
    groupStyles.surface,
    groupStyles.group,
    fieldsetStyles.group,
    xstyle,
  );
  return (
    <FieldGroupContext value={true}>
      <div
        {...props}
        {...compiled}
        style={{ ...compiled.style, ...style }}
        data-slot={slot ?? "fieldset-group"}
      />
    </FieldGroupContext>
  );
}
/** @deprecated Use Fieldset.Group for a shared form surface. */
export const FieldGroup = FieldsetGroup;

export function FieldsetRow({ xstyle, style, ...props }: StyleXProps<Field.Root.Props>) {
  const compiled = stylex.props(
    groupStyles.row,
    groupStyles.divided,
    groupStyles.fieldFocus,
    fieldsetStyles.row,
    xstyle,
  );
  return (
    <FieldScope value={true}>
      <Field.Root
        {...props}
        {...compiled}
        style={mergeStyle<Field.Root.State>(compiled.style, style)}
        data-slot="fieldset-row"
        data-field-layout="row"
      />
    </FieldScope>
  );
}
export function FieldsetActions({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(fieldsetStyles.actions, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={slot ?? "fieldset-actions"}
    />
  );
}
export const Fieldset = Object.assign(FieldsetRoot, {
  Root: FieldsetRoot,
  Legend: FieldsetLegend,
  Group: FieldsetGroup,
  Row: FieldsetRow,
  Actions: FieldsetActions,
});
export type FieldsetRootProps = React.ComponentProps<typeof FieldsetRoot>;
export type FieldsetProps = FieldsetRootProps;
export type FieldsetLegendProps = React.ComponentProps<typeof FieldsetLegend>;
export type FieldGroupProps = React.ComponentProps<typeof FieldGroup>;
export type FieldsetGroupProps = React.ComponentProps<typeof FieldsetGroup>;
export type FieldsetRowProps = React.ComponentProps<typeof FieldsetRow>;
export type FieldsetActionsProps = React.ComponentProps<typeof FieldsetActions>;
