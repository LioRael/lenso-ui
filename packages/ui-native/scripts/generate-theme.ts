import { readFile, writeFile } from "node:fs/promises";
import { format } from "oxfmt";
import { appleColors } from "../../tokens/src/apple-colors.ts";

const roles = {
  background: "background-primary",
  groupedBackground: "background-grouped-primary",
  secondaryBackground: "background-secondary",
  label: "label-primary",
  secondaryLabel: "label-secondary",
  tint: "system-blue",
  destructive: "system-red",
  switchOn: "system-green",
  fill: "fill-tertiary",
} as const;
const rgba = (channels: readonly number[]) =>
  `rgba(${channels
    .slice(0, 3)
    .map((v) => Math.round(v * 255))
    .join(",")},${channels[3]})`;
const palettes = Object.fromEntries(
  (["light", "dark"] as const).map((mode) => [
    mode,
    Object.fromEntries(
      Object.entries(roles).map(([name, role]) => [
        name,
        rgba(appleColors[`${mode}-standard-base`][role]),
      ]),
    ),
  ]),
);
const files = {
  "palette.ts": `// Generated from @lenso/tokens Apple semantic colors. Do not edit.\nexport const palettes = ${JSON.stringify(palettes, null, 2)} as const;\n`,
  "theme.css.ts": `// Generated from @lenso/tokens Apple semantic colors. Do not edit.\nimport { css } from "react-strict-dom";\nexport const colors = css.defineVars(${JSON.stringify(
    Object.fromEntries(
      Object.keys(roles).map((key) => [
        key,
        {
          default: palettes["light"]![key],
          "@media (prefers-color-scheme: dark)": palettes["dark"]![key],
        },
      ]),
    ),
    null,
    2,
  )});\n`,
};
const options = JSON.parse(
  await readFile(new URL("../../../.oxfmtrc.json", import.meta.url), "utf8"),
);
for (const [name, input] of Object.entries(files)) {
  const result = await format(name, input, options);
  if (result.errors.length) throw new Error(JSON.stringify(result.errors));
  const source = result.code;
  const path = new URL(`../src/${name}`, import.meta.url);
  if (process.argv.includes("--check")) {
    if ((await readFile(path, "utf8")) !== source)
      throw new Error(`Native ${name} is stale; run generate.`);
  } else await writeFile(path, source);
}
