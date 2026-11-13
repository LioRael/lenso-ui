"use client";
import {
  Field as SdkField,
  FieldSet as SdkFieldSet,
  FieldLegend as SdkFieldLegend,
  type FieldState,
  type FieldSetState,
} from "@ui-sdk/react/field";
import { slotRender } from "../../utils/sdk-render.js";
import { fieldsetStyles } from "@lenso/tokens/fieldset";
import { groupStyles } from "@lenso/tokens/surface";
import { FieldGroupContext } from "../textfield/group-context.js";
import { FieldScope } from "../textfield/field-scope.js";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
export function FieldsetRoot({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<
  Omit<React.ComponentProps<typeof SdkFieldSet>, "ref"> & React.RefAttributes<HTMLFieldSetElement>
> & {
  "data-lenso-slot"?: unknown;
}) {
  const compiled = stylex.props(fieldsetStyles.root, xstyle);
  return (
    <FieldGroupContext value={false}>
      <FieldScope value={false}>
        <SdkFieldSet
          {...props}
          {...compiled}
          style={mergeStyle<FieldSetState>(compiled.style, style)}
          render={slotRender("fieldset", slot ?? "fieldset", props.render)}
        />
      </FieldScope>
    </FieldGroupContext>
  );
}
export function FieldsetLegend({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof SdkFieldLegend>> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(fieldsetStyles.legend, xstyle);
  return (
    <SdkFieldLegend
      {...props}
      {...compiled}
      style={mergeStyle<FieldSetState>(compiled.style, style)}
      render={slotRender("legend", slot ?? "fieldset-legend", props.render)}
    />
  );
}
export function FieldsetGroup({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-lenso-slot"?: unknown }) {
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
        data-lenso-slot={slot ?? "fieldset-group"}
      />
    </FieldGroupContext>
  );
}
/** @deprecated Use Fieldset.Group for a shared form surface. */
export const FieldGroup = FieldsetGroup;

export function FieldsetRow({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentProps<typeof SdkField>>) {
  const compiled = stylex.props(
    groupStyles.row,
    groupStyles.divided,
    groupStyles.fieldFocus,
    fieldsetStyles.row,
    xstyle,
  );
  return (
    <FieldScope value={true}>
      <SdkField
        {...props}
        {...compiled}
        style={mergeStyle<FieldState>(compiled.style, style)}
        render={slotRender("div", "fieldset-row", props.render)}
        data-field-layout="row"
      />
    </FieldScope>
  );
}
export function FieldsetActions({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(fieldsetStyles.actions, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot={slot ?? "fieldset-actions"}
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
