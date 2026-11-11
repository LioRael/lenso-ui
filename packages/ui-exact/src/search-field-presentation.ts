import * as stylex from "@stylexjs/stylex";
import { searchFieldStyles, searchFieldGroupStyles } from "@lenso/tokens/search-field";
import { liquidMaterialStyles } from "@lenso/tokens/materials";

const native = stylex.create({
  input: {
    appearance: {
      default: "none",
      ":is(#exact-root input[data-native])": "none",
    },
    borderWidth: { default: 0, ":is(#exact-root input[data-native])": 0 },
    borderRadius: { default: 0, ":is(#exact-root input[data-native])": 0 },
    padding: { default: 0, ":is(#exact-root input[data-native])": 0 },
    lineHeight: {
      default: "20px",
      ":is(#exact-root input[data-native])": "20px",
    },
  },
  clear: {
    backgroundImage: "none",
    "--exact-hover-wash": "none",
    "--exact-hover-dim": "1",
  },
});

export const searchFieldKinds = [
  "search-field-input",
  "search-field-icon",
  "search-field-clear",
  "search-field-clear-icon",
];

export function searchFieldPresentation(kind: string, data: DOMStringMap) {
  switch (kind) {
    case "search-field":
      return [
        searchFieldStyles.root,
        data["lensoFullWidth"] === "true" && searchFieldGroupStyles.fullWidth,
      ];
    case "search-field-group": {
      const variant = data["lensoVariant"];
      if (variant !== "primary" && variant !== "secondary")
        throw new RangeError(`Unknown Lenso SearchField variant: ${variant}`);
      return [
        liquidMaterialStyles.small,
        searchFieldGroupStyles.root,
        variant === "secondary" && searchFieldGroupStyles.secondary,
        data["lensoFullWidth"] === "true" && searchFieldGroupStyles.fullWidth,
      ];
    }
    case "search-field-input":
      return [searchFieldGroupStyles.input, native.input];
    case "search-field-icon":
      return [searchFieldStyles.icon];
    case "search-field-clear":
      return [searchFieldStyles.clear, native.clear];
    case "search-field-clear-icon":
      return [searchFieldStyles.clearIcon];
    default:
      return undefined;
  }
}
