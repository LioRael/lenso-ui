import { themes, type SemanticToken, type ThemeName } from "@lenso/tokens";

// Compare rendered color resolution with the public theme contract, without copying palette literals.
export function themeColor(theme: ThemeName, token: SemanticToken): string {
  const color = themes[theme][token];
  if (!/^#[0-9a-f]{6}$/i.test(color)) throw new Error(`Expected opaque color: ${token}`);
  return `rgb(${[1, 3, 5].map((offset) => Number.parseInt(color.slice(offset, offset + 2), 16)).join(", ")})`;
}
