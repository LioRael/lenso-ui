import { describe, expect, it } from "vitest";

import {
  compileResolver,
  publicTokenPaths,
  renderTokenArtifacts,
  type JsonDocumentMap,
  type ResolverDocument,
} from "./generator.js";

const resolver: ResolverDocument = {
  version: "2025.10",
  sets: {
    foundation: { sources: [{ $ref: "foundation.json" }] },
    semantic: { sources: [{ $ref: "semantic.json" }] },
  },
  modifiers: {
    theme: {
      default: "light",
      contexts: {
        light: [{ $ref: "themes/light.json" }],
        dark: [{ $ref: "themes/dark.json" }],
      },
    },
  },
  resolutionOrder: [
    { $ref: "#/sets/foundation" },
    { $ref: "#/sets/semantic" },
    { $ref: "#/modifiers/theme" },
  ],
};

const files: JsonDocumentMap = {
  "foundation.json": {
    primitive: {
      color: {
        white: {
          $type: "color",
          $value: {
            colorSpace: "srgb",
            components: [1, 1, 1],
            alpha: 1,
          },
        },
        black: {
          $type: "color",
          $value: {
            colorSpace: "srgb",
            components: [0, 0, 0],
            alpha: 1,
          },
        },
      },
      radius: {
        control: {
          $type: "dimension",
          $value: { value: 8, unit: "px" },
        },
      },
    },
  },
  "semantic.json": {
    color: {
      surface: {
        canvas: { $type: "color", $value: "{primitive.color.white}" },
      },
    },
    radius: {
      control: { $type: "dimension", $value: "{primitive.radius.control}" },
    },
  },
  "themes/light.json": {
    color: {
      surface: {
        canvas: { $type: "color", $value: "{primitive.color.white}" },
      },
    },
    radius: {
      control: { $type: "dimension", $value: "{primitive.radius.control}" },
    },
  },
  "themes/dark.json": {
    color: {
      surface: {
        canvas: { $type: "color", $value: "{primitive.color.black}" },
      },
    },
    radius: {
      control: { $type: "dimension", $value: "{primitive.radius.control}" },
    },
  },
};

describe("compileResolver", () => {
  it("resolves a DTCG modifier into complete deterministic themes", () => {
    const result = compileResolver(resolver, files, {
      publicPrimitiveRoots: ["primitive.color"],
      publicRoots: ["color", "radius"],
      requiredSemanticPaths: ["color.surface.canvas", "radius.control"],
    });

    expect(result.contexts.light!["color.surface.canvas"]).toMatchObject({
      cssName: "--color-surface-canvas",
      cssValue: "#ffffff",
      type: "color",
    });
    expect(result.contexts.dark!["color.surface.canvas"]!.cssValue).toBe("#000000");
    expect(result.contexts.dark!["radius.control"]!.cssValue).toBe("8px");

    const first = renderTokenArtifacts(result);
    const second = renderTokenArtifacts(result);
    expect(first).toEqual(second);
    expect(first.css).toContain('[data-theme="dark"]');
    expect(first.css).toContain("--color-primitive-white: #ffffff");
    expect(first.stylex).toContain("stylex.defineConsts");
    expect(first.stylex).toContain("export const primitiveTokens");
    expect(first.stylex).toContain("var(--color-surface-canvas, #ffffff)");
    expect(first.typescript).toContain('"color.surface.canvas"');
    expect(first.typescript).toContain('"primitive.color.white"');
    expect(first.figmaManifestJson).toContain('"figmaName": "white"');
  });

  it("keeps CSS generic font families unquoted", () => {
    const fontFiles = structuredClone(files);
    fontFiles["foundation.json"]!.primitive = {
      ...(fontFiles["foundation.json"]!.primitive as Record<string, unknown>),
      fontFamily: {
        sans: { $type: "fontFamily", $value: ["Example Sans", "system-ui", "sans-serif"] },
      },
    };
    fontFiles["semantic.json"]!.font = {
      sans: { $type: "fontFamily", $value: "{primitive.fontFamily.sans}" },
    };
    for (const theme of ["themes/light.json", "themes/dark.json"]) {
      fontFiles[theme]!.font = {
        sans: { $type: "fontFamily", $value: "{primitive.fontFamily.sans}" },
      };
    }
    const result = compileResolver(resolver, fontFiles, {
      publicRoots: ["font"],
      requiredSemanticPaths: ["font.sans"],
    });

    expect(renderTokenArtifacts(result).css).toContain(
      '--font-sans: "Example Sans", system-ui, sans-serif;',
    );
  });

  it("rejects incomplete theme contexts", () => {
    const incompleteFiles = structuredClone(files);
    delete (incompleteFiles["themes/dark.json"] as Record<string, unknown>).color;

    expect(() =>
      compileResolver(resolver, incompleteFiles, {
        publicRoots: ["color", "radius"],
        requiredSemanticPaths: ["color.surface.canvas", "radius.control"],
      }),
    ).toThrow(/dark.*color\.surface\.canvas/i);
  });

  it("rejects alias cycles", () => {
    const cyclicFiles = structuredClone(files);
    for (const theme of ["themes/light.json", "themes/dark.json"]) {
      cyclicFiles[theme] = {
        ...(cyclicFiles[theme] as Record<string, unknown>),
        color: {
          surface: {
            canvas: { $type: "color", $value: "{color.surface.canvas}" },
          },
        },
      };
    }

    expect(() =>
      compileResolver(resolver, cyclicFiles, {
        publicRoots: ["color", "radius"],
        requiredSemanticPaths: ["color.surface.canvas"],
      }),
    ).toThrow(/cycle/i);
  });

  it("preserves schema-valid prototype-like token names", () => {
    const document = JSON.parse(
      '{"__proto__":{"$type":"number","$value":1}}',
    ) as JsonDocumentMap[string];

    expect(publicTokenPaths(document, ["__proto__"])).toEqual(["__proto__"]);
  });
});
