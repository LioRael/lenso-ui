// Date-input state mapping retains NextUI Inc. Apache-2.0 attribution from the shared recipe.
import * as stylex from "@stylexjs/stylex";
import { timeFieldStyles as t } from "@lenso/tokens/time-field";
import { dateFieldStyles as f } from "@lenso/tokens/date-field";
import { dateInputGroupStyles as g } from "@lenso/tokens/date-input-group";
const native = stylex.create({
  empty: { ":empty": { display: "none" } },
  validation: {
    ":is([data-date-invalid])": {
      backgroundColor: "var(--lenso-control-field-focus-fill)",
      borderColor: "var(--lenso-status-error-indicator)",
      boxShadow: "inset 0 -1.5px 0 var(--lenso-status-error-indicator)",
    },
  },
  segment: {
    ":placeholder-shown": { color: "var(--lenso-label-placeholder)" },
    ":is([data-date-invalid] *)": { color: "var(--lenso-status-error-text)" },
  },
  hidden: { display: "none" },
  input: {
    ":focus": {
      backgroundColor: "var(--lenso-control-tint-subtle-fill)",
      color: "var(--lenso-tint-text)",
    },
  },
  invalid: { color: "var(--lenso-status-error-text)" },
});
export const dateFieldKinds = [
  "time-field",
  "date-field-request",
  "date-field-proxy",
  "date-field-validation",
  "date-input-group-input",
  "date-input-literal",
  "date-input-prefix",
  "date-input-suffix",
  "date-field-error",
];
export function dateFieldPresentation(kind: string, data: DOMStringMap) {
  if (kind === "time-field") return [t.root, data["lensoFullWidth"] === "true" && t.fullWidth];
  if (kind === "date-field") return [f.root, data["lensoFullWidth"] === "true" && f.fullWidth];
  if (kind === "date-field-description")
    return [f.description, native.empty, data["lensoInvalid"] === "true" && f.hidden];
  if (kind === "date-field-error") return [f.error, native.empty];
  if (kind === "date-field-request") return [native.hidden];
  if (kind === "date-field-proxy" || kind === "date-field-validation") return [g.hiddenControl];
  if (kind === "date-input-group") {
    if (!["primary", "secondary"].includes(data["lensoVariant"] ?? ""))
      throw new RangeError(`Unknown date input variant: ${data["lensoVariant"]}`);
    return [
      g.root,
      native.validation,
      data["lensoVariant"] === "secondary" && g.secondary,
      data["lensoFullWidth"] === "true" && g.fullWidth,
      data["lensoDisabled"] === "true" && g.disabled,
      data["lensoInvalid"] === "true" && g.invalid,
    ];
  }
  if (kind === "date-input-group-input") return [g.input];
  if (kind === "date-input-segment")
    return [
      g.segment,
      g.segmentInput,
      native.input,
      native.segment,
      data["lensoInvalid"] === "true" && native.invalid,
    ];
  if (kind === "date-input-literal") return [g.segment, g.literal];
  if (kind === "date-input-prefix") return [g.prefix];
  if (kind === "date-input-suffix") return [g.suffix];
}
