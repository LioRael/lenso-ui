"use client";
// HeroUI v3.2.6, Apache-2.0.
import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";
import { fieldsetStyles } from "@lenso/tokens/fieldset";
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
    <BaseFieldset.Root
      {...props}
      {...compiled}
      style={mergeStyle<BaseFieldset.Root.State>(compiled.style, style)}
      data-slot={slot ?? "fieldset"}
    />
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
export function FieldGroup({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(fieldsetStyles.group, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={slot ?? "field-group"}
    />
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
  Group: FieldGroup,
  Actions: FieldsetActions,
});
export type FieldsetRootProps = React.ComponentProps<typeof FieldsetRoot>;
export type FieldsetProps = FieldsetRootProps;
export type FieldsetLegendProps = React.ComponentProps<typeof FieldsetLegend>;
export type FieldGroupProps = React.ComponentProps<typeof FieldGroup>;
export type FieldsetActionsProps = React.ComponentProps<typeof FieldsetActions>;
