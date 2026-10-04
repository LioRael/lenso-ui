import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const compileMode = Object.freeze({
  dev: false,
  styleResolution: "property-specificity",
  classNamePrefix: "x",
  runtimeInjection: false,
});
export const contract = Object.freeze({
  format: "@lenso/stylex-build/raw-rules",
  version: 1,
  compiler: "@stylexjs/babel-plugin",
  compilerVersion: "0.19.1",
  compileMode,
});
const digest = (rules) => createHash("sha256").update(JSON.stringify(rules)).digest("hex");

export function validateRules(rules, origin) {
  if (
    !Array.isArray(rules) ||
    rules.some(
      (rule) =>
        !Array.isArray(rule) ||
        rule.length !== 3 ||
        typeof rule[0] !== "string" ||
        typeof rule[1]?.ltr !== "string" ||
        !(rule[1]?.rtl === null || typeof rule[1]?.rtl === "string") ||
        typeof rule[2] !== "number" ||
        !Number.isFinite(rule[2]),
    )
  ) {
    throw new Error(
      `[lenso/stylex-build] Invalid raw StyleX rules in ${origin}. Rebuild the package.`,
    );
  }
  return rules;
}

export function createMetadata(rules) {
  validateRules(rules, "compiler output");
  const stable = [...new Map(rules.map((rule) => [JSON.stringify(rule), rule])).values()].sort(
    (a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b), "en"),
  );
  return { ...contract, rulesSha256: digest(stable), rules: stable };
}

export function readMetadata(location) {
  let file = location;
  let value;
  try {
    if (location instanceof URL) file = fileURLToPath(location);
    else if (typeof location === "string" && location.startsWith("file:"))
      file = fileURLToPath(new URL(location));
    value = JSON.parse(readFileSync(file, "utf8"));
  } catch (cause) {
    throw new Error(
      `[lenso/stylex-build] Cannot read raw-rule metadata ${file}. Build @lenso/tokens first and resolve its stylex-rules.json export; do not fall back to independently compiled CSS.`,
      { cause },
    );
  }
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error(
      `[lenso/stylex-build] Invalid metadata object in ${file}. Rebuild the package.`,
    );
  for (const [key, expected] of Object.entries(contract)) {
    const actual = value[key];
    const matches =
      key === "compileMode"
        ? actual &&
          Object.keys(actual).length === Object.keys(expected).length &&
          Object.entries(expected).every(([name, item]) => actual[name] === item)
        : actual === expected;
    if (!matches)
      throw new Error(
        `[lenso/stylex-build] Incompatible ${key} in ${file}. Expected ${JSON.stringify(expected)}; received ${JSON.stringify(actual)}. Pin @lenso/stylex-build 0.1.0 and StyleX 0.19.1, then rebuild both package and application.`,
      );
  }
  validateRules(value.rules, file);
  if (digest(value.rules) !== value.rulesSha256)
    throw new Error(
      `[lenso/stylex-build] Raw-rule digest mismatch in ${file}. Rebuild the package.`,
    );
  return { file, rules: value.rules };
}
