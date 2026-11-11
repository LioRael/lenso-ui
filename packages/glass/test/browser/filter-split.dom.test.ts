import { afterEach, expect, test } from "bun:test";
import { lensFilter, splitFilter } from "../../src/filter-split.js";

const SVG = "http://www.w3.org/2000/svg";

type Attributes = Record<string, string | undefined>;

function primitive(name: string, attributes: Attributes) {
  const node = document.createElementNS(SVG, name);
  for (const [key, value] of Object.entries(attributes))
    if (value !== undefined) node.setAttribute(key, value);
  return node;
}

function lens(tail: Attributes[]) {
  const filter = document.createElementNS(SVG, "filter");
  filter.id = "lens";
  filter.setAttribute("color-interpolation-filters", "sRGB");
  filter.setAttribute("data-lenso-tone", "dark");
  filter.append(
    primitive("feImage", { href: "data:image/png;base64,AA==", result: "field" }),
    primitive("feDisplacementMap", { in: "SourceGraphic", in2: "field", result: "bent" }),
    primitive("feColorMatrix", { in: "bent", type: "saturate", values: "1", result: "face" }),
    ...tail.map(({ name, ...attributes }) => primitive(name!, attributes)),
  );
  return filter;
}

const tone = [
  { name: "feColorMatrix", in: "face", result: "luminance" },
  { name: "feComponentTransfer", in: "luminance", result: "gain" },
  { name: "feComposite", in: "face", in2: "gain", operator: "arithmetic", result: "toned" },
  { name: "feComposite", in: "toned", in2: "face", operator: "in", result: "material-face" },
];

afterEach(() => document.body.replaceChildren());

test("splits the encoded optics from a tail that reads them repeatedly", () => {
  const filter = lens(tone);
  const split = splitFilter(filter, "face")!;
  expect(split.value).toBe('url("#lens-optics") url("#lens-material")');
  const [optics, material] = split.nodes;
  expect([...optics!.children].map((node) => node.getAttribute("result"))).toEqual([
    "field",
    "bent",
    "face",
  ]);
  expect([...material!.children].map((node) => node.getAttribute("result"))).toEqual(
    tone.map(({ result }) => result),
  );
  const reads = [...material!.children].flatMap((node) => [
    node.getAttribute("in"),
    node.getAttribute("in2"),
  ]);
  expect(reads).not.toContain("face");
  expect(reads.filter((name) => name === "SourceGraphic")).toHaveLength(3);
  for (const stage of split.nodes) {
    expect(stage.getAttribute("color-interpolation-filters")).toBe("sRGB");
    expect(stage.getAttribute("data-lenso-tone")).toBe("dark");
  }
  expect(filter.children).toHaveLength(7);
});

test("resolves either stage back to the complete optical graph", () => {
  const filter = lens(tone);
  const split = splitFilter(filter, "face")!;
  const defs = document.createElementNS(SVG, "svg");
  defs.append(filter, ...split.nodes);
  document.body.append(defs);
  expect(lensFilter(split.value)).toBe(filter);
  expect(lensFilter('url("#lens")')).toBe(filter);
  expect(lensFilter("saturate(1)")).toBeNull();
});

test.each([
  ["a single read", [{ name: "feColorMatrix", in: "face", result: "material-face" }]],
  [
    "the raw backdrop",
    [
      { name: "feColorMatrix", in: "face", result: "tone" },
      { name: "feComposite", in: "tone", in2: "SourceGraphic", result: "material-face" },
      { name: "feComposite", in: "face", in2: "material-face", result: "out" },
    ],
  ],
  [
    "an earlier optics result",
    [
      { name: "feColorMatrix", in: "face", result: "tone" },
      { name: "feComposite", in: "tone", in2: "bent", result: "material-face" },
      { name: "feComposite", in: "face", in2: "material-face", result: "out" },
    ],
  ],
  [
    "an implicit input",
    [
      { name: "feColorMatrix", in: "face", result: "tone" },
      { name: "feGaussianBlur", stdDeviation: "1", result: "soft" },
      { name: "feComposite", in: "face", in2: "soft", result: "out" },
    ],
  ],
])("keeps one filter when the tail reads %s", (_, tail) => {
  expect(splitFilter(lens(tail), "face")).toBeUndefined();
});
