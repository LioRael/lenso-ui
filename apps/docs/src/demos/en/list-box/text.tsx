// Source collection text is not a form Field.Label or Field.Description.
import * as stylex from "@stylexjs/stylex";
import { labelStyles } from "@lenso/tokens/label";
import { descriptionStyles } from "@lenso/tokens/description";
export function Label(props: React.ComponentProps<"span">) {
  return <span {...props} {...stylex.props(labelStyles.label)} data-slot="label" />;
}
export function Description(props: React.ComponentProps<"span">) {
  return (
    <span {...props} {...stylex.props(descriptionStyles.description)} data-slot="description" />
  );
}
