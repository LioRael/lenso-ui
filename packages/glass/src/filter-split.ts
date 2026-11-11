const SVG = "http://www.w3.org/2000/svg";
const OPTICS_OF = "data-lenso-optics-of";
const NO_INPUT = new Set(["feImage", "feFlood", "feTurbulence"]);
const TWO_INPUTS = new Set(["feBlend", "feComposite", "feDisplacementMap"]);

export interface SplitFilter {
  value: string;
  nodes: SVGElement[];
}

function inputs(node: Element): (string | null)[] {
  if (node.localName === "feMerge")
    return [...node.children].map((child) => child.getAttribute("in"));
  if (NO_INPUT.has(node.localName)) return [];
  if (TWO_INPUTS.has(node.localName)) return [node.getAttribute("in"), node.getAttribute("in2")];
  return [node.getAttribute("in")];
}

function readsOnlySource(head: Element[], tail: Element[], source: string): number {
  const headResults = new Set(head.map((node) => node.getAttribute("result")));
  const tailResults = new Set<string>();
  let reads = 0;
  for (const node of tail) {
    for (const name of inputs(node)) {
      if (!name) return 0;
      if (tailResults.has(name)) continue;
      if (name !== source || !headResults.has(name)) return 0;
      reads++;
    }
    const result = node.getAttribute("result");
    if (result === source) return 0;
    if (result) tailResults.add(result);
  }
  return reads;
}

function stage(filter: SVGElement, id: string, primitives: Element[]): SVGElement {
  const node = filter.cloneNode(false) as SVGElement;
  node.id = id;
  for (const primitive of primitives) node.append(primitive.cloneNode(true));
  return node;
}

function readFromSource(filter: SVGElement, source: string) {
  for (const primitive of filter.children) {
    const targets = primitive.localName === "feMerge" ? [...primitive.children] : [primitive];
    for (const target of targets)
      for (const name of ["in", "in2"])
        if (target.getAttribute(name) === source) target.setAttribute(name, "SourceGraphic");
  }
}

export function splitFilter(filter: SVGElement, source: string): SplitFilter | undefined {
  const primitives = [...filter.children].filter((node) => node.namespaceURI === SVG);
  if (primitives.length !== filter.children.length) return;
  const at = primitives.findIndex((node) => node.getAttribute("result") === source);
  if (at < 0) return;
  const head = primitives.slice(0, at + 1);
  const tail = primitives.slice(at + 1);
  if (readsOnlySource(head, tail, source) < 2) return;
  const optics = stage(filter, `${filter.id}-optics`, head);
  const material = stage(filter, `${filter.id}-material`, tail);
  optics.setAttribute(OPTICS_OF, filter.id);
  material.setAttribute(OPTICS_OF, filter.id);
  readFromSource(material, source);
  return {
    value: `url("#${optics.id}") url("#${material.id}")`,
    nodes: [optics, material],
  };
}

export function lensFilter(value: string, root: Document = document): Element | null {
  const id = value.match(/#([^"')\s]+)/)?.[1];
  const node = id ? root.getElementById(id) : null;
  const source = node?.getAttribute(OPTICS_OF);
  return source ? root.getElementById(source) : node;
}
