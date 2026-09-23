import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  defineConfig,
  lintFiles,
  loadConfig,
  runDesignLint,
  type DesignLintConfig,
} from "../src/index.js";

const makeTokenContract = async (directory: string): Promise<string> => {
  const path = join(directory, "contract.json");
  await writeFile(
    path,
    JSON.stringify({
      defaultContext: "light",
      contexts: {
        light: {
          "color.action.primary": {
            path: "color.action.primary",
            type: "color",
            cssValue: "#000000",
          },
          "color.content.primary": {
            path: "color.content.primary",
            type: "color",
            cssValue: "#ffffff",
          },
          "space.1": { path: "space.1", type: "dimension", cssValue: "4px" },
          "space.2": { path: "space.2", type: "dimension", cssValue: "8px" },
          "space.3": { path: "space.3", type: "dimension", cssValue: "12px" },
          "radius.control": { path: "radius.control", type: "dimension", cssValue: "8px" },
          "radius.panel": { path: "radius.panel", type: "dimension", cssValue: "10px" },
          "radius.popover": { path: "radius.popover", type: "dimension", cssValue: "12px" },
        },
      },
    }),
  );
  return path;
};

const makeConfig = (source: string): DesignLintConfig => ({
  adapter: "stylex",
  stylex: { validImports: ["@stylexjs/stylex", "stylex"] },
  tokens: {
    source,
    imports: ["@lenso/tokens/tokens.stylex"],
    families: {
      color: {
        tokenPrefixes: ["color."],
        properties: ["color", "backgroundColor", "borderColor"],
        allowLiterals: ["transparent", "currentColor"],
      },
      spacing: {
        tokenPrefixes: ["space."],
        properties: ["padding", "paddingInline", "gap", "marginInline"],
        allowLiterals: [0, "0", "auto"],
      },
      radius: {
        tokenPrefixes: ["radius."],
        properties: ["borderRadius"],
        allowLiterals: [0, "0", "inherit"],
      },
    },
  },
});

const lintSource = async (
  sourceText: string,
  configMutator?: (config: DesignLintConfig) => void,
) => {
  const directory = await mkdtemp(join(tmpdir(), "lenso-design-lint-"));
  const tokenSource = await makeTokenContract(directory);
  const config = makeConfig(tokenSource);
  configMutator?.(config);
  const source = join(directory, "fixture.tsx");
  await writeFile(source, sourceText);
  return lintFiles([source], config, { configDir: directory });
};

describe("@lenso/design-lint", () => {
  it("reports raw color, spacing, and radius literals with deterministic nearest tokens", async () => {
    const result = await lintSource(`
      import * as sx from "@stylexjs/stylex";
      const styles = sx.create({
        root: { color: "#ff0000", padding: "10px", borderRadius: "11px" },
      });
    `);

    expect(result.diagnostics.map((diagnostic) => diagnostic.ruleId)).toEqual([
      "design/color-literal",
      "design/spacing-literal",
      "design/radius-literal",
    ]);
    expect(result.diagnostics[0]?.message).toContain(
      'Design contract: property "color" must use an approved color token; found raw literal "#ff0000".',
    );
    expect(result.diagnostics[0]?.message).toContain("color.action.primary (#000000)");
    expect(result.diagnostics[1]?.message).toContain(
      "Nearest approved tokens: space.2 (8px), space.3 (12px)",
    );
    expect(result.diagnostics[2]?.message).toContain(
      "Nearest approved tokens: radius.panel (10px), radius.popover (12px)",
    );
  });

  it("follows renamed StyleX and token imports through conditional values", async () => {
    const result = await lintSource(`
      import { create as makeStyles } from "@stylexjs/stylex";
      import { tokens as designTokens } from "@lenso/tokens/tokens.stylex";
      const styles = makeStyles({
        root: {
          color: {
            default: designTokens.colorContentPrimary,
            ":hover": "#ff0000",
          },
          padding: designTokens.space2,
          borderRadius: designTokens.radiusControl,
        },
      });
    `);

    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]?.ruleId).toBe("design/color-literal");
    expect(result.diagnostics[0]?.message).toContain('property "color"');
    expect(result.skipped).toHaveLength(0);
  });

  it("reports a known token from the wrong configured family", async () => {
    const result = await lintSource(`
      import * as stylex from "@stylexjs/stylex";
      import { tokens } from "@lenso/tokens/tokens.stylex";
      const styles = stylex.create({
        root: { padding: tokens.colorContentPrimary },
      });
    `);

    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]?.ruleId).toBe("design/wrong-family-token");
    expect(result.diagnostics[0]?.message).toContain(
      'property "padding" requires a spacing token; found "color.content.primary"',
    );
    expect(result.diagnostics[0]?.message).toContain("space.2 (8px)");
  });

  it("allows declared layout xstyle and rejects owned Button properties with guidance", async () => {
    const result = await lintSource(
      `
        import { Button as ActionButton } from "@lenso/ui/button";
        import { create as makeStyles } from "@stylexjs/stylex";
        import { tokens } from "@lenso/tokens/tokens.stylex";
        const styles = makeStyles({
          layout: { width: "86px", marginInline: tokens.space2 },
          owned: { paddingInline: tokens.space2 },
        });
        export function Example() {
          return <>
            <ActionButton xstyle={styles.layout}>Allowed</ActionButton>
            <ActionButton xstyle={[styles.owned, true && styles.layout]}>Owned</ActionButton>
          </>;
        }
      `,
      (config) => {
        config.components = [
          {
            source: "@lenso/ui/button",
            export: "Button",
            ownedXstyleProperties: ["paddingInline", "color"],
            allowedXstyleProperties: ["width", "marginInline"],
            guidance: "Use Button's `variant` or `size` props instead.",
          },
        ];
      },
    );

    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]?.ruleId).toBe("component/owned-xstyle");
    expect(result.diagnostics[0]?.message).toContain(
      'Button owns "paddingInline" and it cannot be overridden through xstyle',
    );
    expect(result.diagnostics[0]?.message).toContain("variant");
    expect(result.diagnostics[0]?.message).toContain("size");
    expect(result.skipped).toHaveLength(0);
  });

  it("rejects xstyle properties that are neither owned nor declared allowed", async () => {
    const result = await lintSource(
      `
        import { Button } from "@lenso/ui/button";
        import * as stylex from "@stylexjs/stylex";
        const styles = stylex.create({ override: { opacity: 0.5 } });
        export function Example() {
          return <Button xstyle={styles.override}>Undeclared</Button>;
        }
      `,
      (config) => {
        config.components = [
          {
            source: "@lenso/ui/button",
            export: "Button",
            ownedXstyleProperties: ["color"],
            allowedXstyleProperties: ["width"],
            guidance: "Use Button's variant API.",
          },
        ];
      },
    );

    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        ruleId: "component/undeclared-xstyle",
        message: expect.stringContaining('does not declare "opacity"'),
      }),
    ]);
  });

  it("reports dynamic and cross-file xstyle as skipped instead of claiming coverage", async () => {
    const result = await lintSource(
      `
        import { Button } from "@lenso/ui/button";
        declare const externalStyle: unknown;
        export function Example() {
          return <Button xstyle={externalStyle}>Unknown</Button>;
        }
      `,
      (config) => {
        config.components = [
          {
            source: "@lenso/ui/button",
            export: "Button",
            ownedXstyleProperties: ["color"],
            allowedXstyleProperties: ["width"],
            guidance: "Use Button's variant API.",
          },
        ];
      },
    );

    expect(result.diagnostics).toHaveLength(0);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0]?.reason).toContain("dynamic or cross-file");
  });

  it("reports unresolved values and spreads instead of treating them as checked", async () => {
    const result = await lintSource(`
      import * as stylex from "@stylexjs/stylex";
      import { tokens } from "@lenso/tokens/tokens.stylex";
      declare const external: unknown;
      declare const enabled: boolean;
      const styles = stylex.create({
        root: { color: external },
        mixed: { color: enabled ? tokens.colorContentPrimary : external },
        spread: { ...external },
      });
    `);

    expect(result.diagnostics).toHaveLength(0);
    expect(result.skipped.length).toBeGreaterThanOrEqual(3);
    expect(result.skipped.map((item) => item.reason).join("\n")).toContain(
      "not statically provable",
    );
    expect(result.skipped.map((item) => item.reason).join("\n")).toContain("contains a spread");
  });

  it("keeps top-level style ownership stable when a nested scope shadows a name", async () => {
    const result = await lintSource(
      `
        import { Button } from "@lenso/ui/button";
        import * as stylex from "@stylexjs/stylex";
        declare const enabled: boolean;
        declare const externalStyle: unknown;
        const styles = stylex.create({ root: { color: "red" } });
        const override = styles.root;
        export function First() {
          return <Button xstyle={styles.root}>First</Button>;
        }
        export function Second() {
          const styles = stylex.create({ root: { width: "86px" } });
          return <Button xstyle={styles.root}>Second</Button>;
        }
        export function Parameter(override: unknown) {
          return <Button xstyle={override}>Parameter</Button>;
        }
        export function Destructured({ override }: { override: unknown }) {
          return <Button xstyle={override}>Destructured</Button>;
        }
        export function VarShadow() {
          if (enabled) {
            var override = externalStyle;
          }
          return <Button xstyle={override}>Var</Button>;
        }
        export function FunctionShadow() {
          function override() {}
          return <Button xstyle={override}>Function</Button>;
        }
        const NamedFunction = function override() {
          return <Button xstyle={override}>Named function</Button>;
        };
        const NamedClass = class override {
          render() {
            return <Button xstyle={override}>Named class</Button>;
          }
        };
      `,
      (config) => {
        config.components = [
          {
            source: "@lenso/ui/button",
            export: "Button",
            ownedXstyleProperties: ["color"],
            allowedXstyleProperties: ["width"],
            guidance: "Use Button's variant API.",
          },
        ];
      },
    );

    expect(result.diagnostics.map((diagnostic) => diagnostic.ruleId)).toEqual([
      "design/color-literal",
      "component/owned-xstyle",
    ]);
    expect(result.skipped.length).toBeGreaterThanOrEqual(7);
  });

  it("can promote skipped compositions to non-blocking warnings", async () => {
    const result = await lintSource(
      `
        import { Button } from "@lenso/ui/button";
        declare const externalStyle: unknown;
        export function Example() {
          return <Button xstyle={externalStyle}>Unknown</Button>;
        }
      `,
      (config) => {
        config.unresolved = "warn";
        config.components = [
          {
            source: "@lenso/ui/button",
            export: "Button",
            ownedXstyleProperties: ["color"],
            allowedXstyleProperties: ["width"],
            guidance: "Use Button's variant API.",
          },
        ];
      },
    );

    expect(result.skipped).toHaveLength(1);
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        ruleId: "design/unresolved-composition",
        severity: "warning",
      }),
    ]);
  });

  it("does not flag explicit literal exceptions", async () => {
    const result = await lintSource(`
      import * as stylex from "@stylexjs/stylex";
      const styles = stylex.create({
        root: {
          backgroundColor: "transparent",
          padding: 0,
          marginInline: "auto",
          borderRadius: "inherit",
        },
      });
    `);

    expect(result.diagnostics).toHaveLength(0);
  });

  it("keeps positive and negative rule fixtures observable", async () => {
    const directory = await mkdtemp(join(tmpdir(), "lenso-design-fixtures-"));
    const tokenSource = await makeTokenContract(directory);
    const config = makeConfig(tokenSource);
    const positive = fileURLToPath(new URL("../fixtures/rules/positive.tsx", import.meta.url));
    const negative = fileURLToPath(new URL("../fixtures/rules/negative.tsx", import.meta.url));

    const positiveResult = await lintFiles([positive], config, { configDir: directory });
    const negativeResult = await lintFiles([negative], config, { configDir: directory });

    expect(positiveResult.diagnostics).toHaveLength(0);
    expect(negativeResult.diagnostics.map((diagnostic) => diagnostic.ruleId)).toEqual([
      "design/color-literal",
      "design/radius-literal",
      "design/spacing-literal",
    ]);
  });

  it("accepts a nested DTCG token source", async () => {
    const directory = await mkdtemp(join(tmpdir(), "lenso-design-dtcg-"));
    const tokenSource = join(directory, "tokens.json");
    await writeFile(
      tokenSource,
      JSON.stringify({
        color: {
          $type: "color",
          action: {
            primary: { $value: "#000000" },
          },
        },
        space: {
          $type: "dimension",
          2: { $value: { value: 8, unit: "px" } },
        },
      }),
    );
    const config = makeConfig(tokenSource);
    const source = join(directory, "styles.ts");
    await writeFile(
      source,
      `import * as stylex from "@stylexjs/stylex";
export const styles = stylex.create({root: {color: "#ff0000", padding: "10px"}});`,
    );

    const result = await lintFiles([source], config, { configDir: directory });

    expect(result.diagnostics).toHaveLength(2);
    expect(result.diagnostics[0]?.message).toContain("color.action.primary (#000000)");
    expect(result.diagnostics[1]?.message).toContain("space.2 (8px)");
  });

  it("loads JSON and ESM configuration and rejects unsupported keys", async () => {
    const directory = await mkdtemp(join(tmpdir(), "lenso-design-config-"));
    const tokenSource = await makeTokenContract(directory);
    const config = makeConfig(tokenSource);
    const jsonPath = join(directory, "design-lint.config.json");
    await writeFile(jsonPath, JSON.stringify(config));
    await expect(loadConfig(jsonPath)).resolves.toMatchObject({ adapter: "stylex" });

    await writeFile(
      join(directory, "fixture.ts"),
      `import * as stylex from "@stylexjs/stylex";
import { tokens } from "@lenso/tokens/tokens.stylex";
export const styles = stylex.create({root: {padding: tokens.space2}});`,
    );
    const runnerConfig = { ...config, files: ["**/*.ts"] };
    await writeFile(jsonPath, JSON.stringify(runnerConfig));
    await expect(runDesignLint({ config: jsonPath })).resolves.toMatchObject({
      diagnostics: [],
    });

    const modulePath = join(directory, "design-lint.config.mjs");
    await writeFile(modulePath, `export default ${JSON.stringify(config)};`);
    await expect(loadConfig(modulePath)).resolves.toMatchObject({
      tokens: { source: tokenSource },
    });

    await expect(
      loadConfig(
        await (async () => {
          const invalidPath = join(directory, "invalid.json");
          await writeFile(invalidPath, JSON.stringify({ ...config, unsupported: true }));
          return invalidPath;
        })(),
      ),
    ).rejects.toThrow('Unsupported design-lint config key "config.unsupported"');

    expect(defineConfig(config)).toBe(config);
  });
});
