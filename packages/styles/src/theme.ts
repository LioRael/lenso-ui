/** Editable source properties only; derived mixes and aliases remain in theme CSS. */
const categories = {
  white: "color",
  black: "color",
  snow: "color",
  eclipse: "color",
  background: "color",
  foreground: "color",
  surface: "color",
  "surface-foreground": "color",
  "surface-secondary": "color",
  "surface-secondary-foreground": "color",
  "surface-tertiary": "color",
  "surface-tertiary-foreground": "color",
  overlay: "color",
  "overlay-foreground": "color",
  muted: "color",
  default: "color",
  "default-foreground": "color",
  accent: "color",
  "accent-foreground": "color",
  success: "color",
  "success-foreground": "color",
  warning: "color",
  "warning-foreground": "color",
  danger: "color",
  "danger-foreground": "color",
  segment: "color",
  "segment-foreground": "color",
  border: "color",
  separator: "color",
  focus: "color",
  link: "color",
  backdrop: "color",
  "field-background": "color",
  "field-foreground": "color",
  "field-placeholder": "color",
  "field-border": "color",
  radius: "length",
  "field-radius": "length",
  "border-width": "length",
  "field-border-width": "length",
  "font-sans": "font-family",
} as const;

export type ThemeToken = keyof typeof categories;
export type ThemeMode = "light" | "dark";
export type ThemeOverrides = Readonly<Partial<Record<ThemeToken, string>>>;
export interface ThemeConfig {
  readonly name: string;
  readonly light?: ThemeOverrides;
  readonly dark?: ThemeOverrides;
}
export interface Theme {
  readonly name: string;
  readonly light: ThemeOverrides;
  readonly dark: ThemeOverrides;
}
export type ThemeVariables = Readonly<Partial<Record<`--${ThemeToken}`, string>>>;

export const themeTokens = Object.freeze(
  (Object.keys(categories) as ThemeToken[]).map((key) =>
    Object.freeze({
      key,
      label: key.replace(
        /(^|-)([a-z])/g,
        (_, separator: string, letter: string) => `${separator ? " " : ""}${letter.toUpperCase()}`,
      ),
      category: categories[key],
    }),
  ),
);

const number = "[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)";
const component = new RegExp(`^(?:${number}%?|none)$`, "i");
const angle = new RegExp(`^(?:${number}(?:deg|grad|rad|turn)?|none)$`, "i");
const length = new RegExp(
  `^(?:0|${number}(?:px|rem|em|ex|ch|cap|ic|lh|rlh|vw|vh|vi|vb|vmin|vmax|svw|svh|lvw|lvh|dvw|dvh|cm|mm|q|in|pt|pc))$`,
  "i",
);

/** Split only outside functions so nested var fallbacks and color mixes stay intact. */
function split(value: string, delimiter: string): string[] {
  let depth = 0;
  let start = 0;
  const parts: string[] = [];
  for (let i = 0; i < value.length; i++) {
    if (value[i] === "(") depth++;
    if (value[i] === ")") depth--;
    if (depth < 0) return [];
    if (depth === 0 && value[i] === delimiter) {
      parts.push(value.slice(start, i).trim());
      start = i + 1;
    }
  }
  if (depth !== 0) return [];
  parts.push(value.slice(start).trim());
  return parts;
}

function variable(value: string, validate: (value: string) => boolean): boolean {
  if (!value.startsWith("var(") || !value.endsWith(")")) return false;
  const parts = split(value.slice(4, -1), ",");
  return (
    (parts.length === 1 || parts.length === 2) &&
    /^--[a-zA-Z_][a-zA-Z0-9_-]*$/.test(parts[0] ?? "") &&
    (parts.length === 1 || validate(parts[1]!))
  );
}

function color(value: string): boolean {
  if (/^(?:#[\da-f]{3}|#[\da-f]{4}|#[\da-f]{6}|#[\da-f]{8})$/i.test(value)) return true;
  if (/^(?:transparent|currentColor|black|white|red|green|blue)$/i.test(value)) return true;
  if (variable(value, color)) return true;
  const fn = /^(oklch|oklab|lch|lab|rgb|rgba|hsl|hsla|hwb|color-mix)\((.*)\)$/is.exec(value);
  if (!fn) return false;
  const body = fn[2]!;
  if (fn[1]!.toLowerCase() === "color-mix") {
    const parts = split(body, ",");
    const stop = (part: string) => {
      const weighted = /^(.*)\s+(\d+(?:\.\d+)?%)$/.exec(part);
      return weighted ? Number.parseFloat(weighted[2]!) <= 100 && color(weighted[1]!) : color(part);
    };
    const space = /^in ([a-z0-9-]+)(?: (shorter|longer|increasing|decreasing) hue)?$/i.exec(
      parts[0] ?? "",
    );
    return (
      parts.length === 3 &&
      Boolean(
        space &&
        /^(?:oklch|oklab|lch|lab|srgb|srgb-linear|hsl|hwb|xyz|xyz-d50|xyz-d65)$/i.test(space[1]!) &&
        (!space[2] || /^(?:oklch|lch|hsl|hwb)$/i.test(space[1]!)),
      ) &&
      stop(parts[1]!) &&
      stop(parts[2]!)
    );
  }
  const parts = split(body, "/");
  if (parts.length < 1 || parts.length > 2) return false;
  const legacy = split(body, ",");
  const hasCommas = legacy.length > 1;
  const channels = hasCommas ? legacy : split(parts[0]!, " ").filter(Boolean);
  const name = fn[1]!.toLowerCase();
  if (hasCommas && (!/^(?:rgba?|hsla?)$/.test(name) || parts.length !== 1)) return false;
  const validComponent = (part: string): boolean =>
    component.test(part) || variable(part, validComponent);
  const validAngle = (part: string): boolean => angle.test(part) || variable(part, validAngle);
  const hueIndex = /^(?:oklch|lch)$/.test(name) ? 2 : /^(?:hsla?|hwb)$/.test(name) ? 0 : -1;
  if (hasCommas) {
    if (channels.length !== 3 && channels.length !== 4) return false;
    if (channels.some((part) => /^none$/i.test(part))) return false;
    if (/^rgba?$/.test(name)) {
      const percentages = channels.slice(0, 3).map((part) => part.endsWith("%"));
      if (!percentages.every((percentage) => percentage === percentages[0])) return false;
    } else if (
      !validAngle(channels[0]!) ||
      !channels.slice(1, 3).every((part) => /^\s*(?:\d+(?:\.\d*)?|\.\d+)%$/.test(part))
    ) {
      return false;
    }
  }
  return (
    (channels.length === 3 || (hasCommas && channels.length === 4)) &&
    channels.every((part, index) =>
      index === hueIndex ? validAngle(part) : validComponent(part),
    ) &&
    (parts.length === 1 || validComponent(parts[1]!))
  );
}

function dimension(value: string): boolean {
  if (length.test(value)) return !value.startsWith("-");
  if (variable(value, dimension)) return true;
  // Deliberately small calc grammar: length/variable multiplied or divided by a number.
  const calc = /^calc\((.*)\s+([*/])\s+(\d+(?:\.\d+)?)\)$/.exec(value);
  return Boolean(calc && dimension(calc[1]!) && (calc[2] !== "/" || Number(calc[3]) !== 0));
}

function fontFamily(value: string): boolean {
  if (variable(value, fontFamily)) return true;
  const families = split(value, ",");
  return (
    families.length > 0 &&
    families.every((part) =>
      /^(?:[a-zA-Z][a-zA-Z0-9 -]*|"[a-zA-Z0-9 _-]+"|'[a-zA-Z0-9 _-]+')$/.test(part),
    )
  );
}

function object(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
  );
}

function overrides(value: unknown): ThemeOverrides {
  if (value === undefined) return Object.freeze({});
  if (!object(value)) throw new TypeError("Theme mode overrides must be a plain object");
  const result: Partial<Record<ThemeToken, string>> = {};
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== "string" || !Object.hasOwn(categories, key))
      throw new TypeError(`Unknown editable theme token: ${String(key)}`);
    const input = value[key];
    // Protect declarations and HTML style embedding, not just CSS parsing.
    if (
      typeof input !== "string" ||
      input.length > 2048 ||
      /[;{}<>\\!]|\/\*|\*\//.test(input) ||
      [...input].some(
        (character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
      )
    )
      throw new TypeError(`Unsafe CSS value for ${key}`);
    const normalized = input.trim();
    const category = categories[key as ThemeToken];
    const valid =
      category === "color"
        ? color(normalized)
        : category === "length"
          ? dimension(normalized)
          : fontFamily(normalized);
    if (!valid) throw new TypeError(`Unsupported ${category} value for ${key}`);
    result[key as ThemeToken] = normalized;
  }
  return Object.freeze(result);
}

/** Validate and copy input; callers can keep editing their original configuration. */
export function defineTheme(config: ThemeConfig): Theme {
  if (
    !object(config) ||
    Reflect.ownKeys(config).some((key) => !["name", "light", "dark"].includes(String(key)))
  )
    throw new TypeError("Theme must contain only name, light and dark");
  const name = config.name;
  if (typeof name !== "string" || !/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/.test(name))
    throw new TypeError("Theme name must be a safe identifier (1–64 ASCII characters)");
  return Object.freeze({
    name,
    light: overrides(config.light),
    dark: overrides(config.dark),
  });
}

function variables(theme: Theme, mode: ThemeMode): ThemeVariables {
  return Object.freeze(
    Object.fromEntries(Object.entries(theme[mode]).map(([key, value]) => [`--${key}`, value])),
  );
}

export function themeToVariables(config: ThemeConfig, mode: ThemeMode): ThemeVariables {
  const theme = defineTheme(config);
  if (mode !== "light" && mode !== "dark") throw new TypeError("Unknown theme mode");
  return variables(theme, mode);
}

/** Overrides only: load the default theme CSS to supply mode rules and reactive derivations. */
export function themeToCSS(config: ThemeConfig): string {
  const theme = defineTheme(config);
  return (["light", "dark"] as const)
    .map((mode) => {
      const declarations = Object.entries(variables(theme, mode))
        .map(([key, value]) => `  ${key}: ${value};`)
        .join("\n");
      return `[data-lenso-theme="${theme.name}"][data-theme="${mode}"] {\n${declarations}\n}`;
    })
    .join("\n\n");
}
