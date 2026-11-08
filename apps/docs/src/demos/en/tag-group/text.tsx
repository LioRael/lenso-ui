// Native supporting parts retain the source styles without requiring form Field context.
import * as stylex from "@stylexjs/stylex";
import { labelStyles } from "@lenso/tokens/label";
import { descriptionStyles } from "@lenso/tokens/description";
import { fieldErrorStyles } from "@lenso/tokens/field-error";
export function Label(props: React.ComponentProps<"span">) {
  return <span {...props} {...stylex.props(labelStyles.label)} data-slot="label" />;
}
export function Description(props: React.ComponentProps<"span">) {
  return (
    <span {...props} {...stylex.props(descriptionStyles.description)} data-slot="description" />
  );
}
export function ErrorMessage(props: React.ComponentProps<"span">) {
  return <span {...props} {...stylex.props(fieldErrorStyles.error)} data-slot="error-message" />;
}
