import * as stylex from "@stylexjs/stylex";
import { buttonStyles, buttonSizes, buttonVariants } from "@lenso/tokens/button";
import { glassStyles } from "@lenso/tokens/glass";
import {
  glassButtonStyles,
  glassButtonSizes,
  glassButtonVariants,
} from "@lenso/tokens/glass-button";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import { groupStyles, surfaceStyles, surfaceVariants } from "@lenso/tokens/surface";
import { formPresentation, formKinds } from "./forms.js";
import { disclosurePresentation, disclosureKinds } from "./disclosure-presentation.js";

function sizeOf(value: string | undefined) {
  if (value === "sm" || value === "md" || value === "lg") return value;
  throw new RangeError(`Lenso size must be sm, md or lg; received ${value}`);
}

/** Used by both the hatch and build-time attribute selectors. No DOM is needed. */
export function presentation(data: DOMStringMap, inputGroup = false) {
  const { lensoKind: kind, lensoVariant: variant } = data;
  switch (kind) {
    case "surface":
      if (
        variant !== "default" &&
        variant !== "secondary" &&
        variant !== "tertiary" &&
        variant !== "transparent"
      )
        throw new RangeError(`Unknown Lenso Surface variant: ${variant}`);
      return stylex.props(
        surfaceStyles.root,
        variant === "default" && groupStyles.surface,
        surfaceVariants[variant],
      );
    case "glass":
      return stylex.props(glassStyles.root, glassStyles.optics, glassStyles.foreground);
    case "button":
      if (variant !== "prominent" && variant !== "bordered" && variant !== "borderless")
        throw new RangeError(`Unknown Lenso Button variant: ${variant}`);
      return stylex.props(
        buttonStyles.root,
        buttonSizes[sizeOf(data["lensoSize"])],
        buttonVariants[variant],
      );
    case "glass-button":
      if (variant !== "default" && variant !== "prominent")
        throw new RangeError(`Unknown Lenso GlassButton variant: ${variant}`);
      return stylex.props(
        glassButtonStyles.root,
        liquidMaterialStyles.small,
        glassButtonStyles.backdrop,
        glassButtonSizes[sizeOf(data["lensoSize"])],
        glassButtonVariants[variant],
        glassButtonStyles.interaction,
      );
    default: {
      const result =
        kind && (formPresentation(kind, data, inputGroup) ?? disclosurePresentation(kind, data));
      if (!result) throw new RangeError(`Unknown Lenso component: ${kind}`);
      return result;
    }
  }
}

export function presentationCases() {
  const cases: Array<{
    kind: string;
    selector: string;
    classes: string[];
    data: DOMStringMap;
    inputGroup: boolean;
  }> = [];
  const add = (kind: string, data: DOMStringMap = {}, suffix = "", inputGroup = false) => {
    const compiled = presentation({ ...data, lensoKind: kind }, inputGroup);
    if (compiled.style && Object.keys(compiled.style).length)
      throw new Error(`Lenso ${kind} needs a declarative adapter for its inline values`);
    cases.push({
      kind,
      selector: `[data-lenso-kind="${kind}"]${suffix}`,
      classes: compiled.className?.split(" ").filter(Boolean) ?? [],
      data: { ...data, lensoKind: kind },
      inputGroup,
    });
  };
  for (const kind of [...formKinds, ...disclosureKinds, "glass"]) add(kind);
  for (const kind of ["button", "glass-button"])
    for (const size of ["sm", "md", "lg"])
      for (const variant of kind === "button"
        ? ["prominent", "bordered", "borderless"]
        : ["default", "prominent"])
        add(
          kind,
          { lensoSize: size, lensoVariant: variant },
          `[data-lenso-size="${size}"][data-lenso-variant="${variant}"]`,
        );
  for (const variant of ["default", "secondary", "tertiary", "transparent"])
    add("surface", { lensoVariant: variant }, `[data-lenso-variant="${variant}"]`);
  for (const kind of ["input", "textarea", "input-group"])
    for (const variant of ["primary", "secondary"])
      for (const grouped of kind === "input-group" ? [false] : [false, true])
        for (const single of kind === "textarea" ? [false, true] : [false]) {
          const context =
            kind === "input-group"
              ? ""
              : grouped
                ? ':where([data-slot="input-group"] *)'
                : ':not(:where([data-slot="input-group"] *))';
          const rows =
            kind === "textarea"
              ? single
                ? '[data-lenso-rows="1"]'
                : ':not([data-lenso-rows="1"])'
              : "";
          add(
            kind,
            { lensoVariant: variant, lensoRows: single ? "1" : "3" },
            `[data-lenso-variant="${variant}"]${context}${rows}`,
            grouped,
          );
        }
  for (const required of [false, true])
    add("label", { lensoRequired: String(required) }, `[data-lenso-required="${required}"]`);
  for (const kind of ["accordion", "accordion-trigger"])
    for (const variant of ["default", "surface"])
      add(
        kind,
        { lensoVariant: variant, orientation: "vertical" },
        `[data-lenso-variant="${variant}"]`,
      );
  for (const hidden of [false, true])
    add(
      "accordion-item",
      { lensoHideSeparator: String(hidden) },
      `[data-lenso-hide-separator="${hidden}"]`,
    );
  return cases;
}
