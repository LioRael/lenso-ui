import { lensFilter } from "./filter-split.js";
import type { Shape } from "./optical-fields.js";

export interface SceneLens {
  width: number;
  height: number;
  shape: Shape;
  scale: number;
  filter: SVGElement;
}

const lenses = new WeakMap<Element, SceneLens & { revision: number }>();
let revision = 0;

export function registerSceneLens(lens: SceneLens) {
  lenses.set(lens.filter, { ...lens, revision: ++revision });
}

export function readSceneLens(value: string) {
  const filter = lensFilter(value);
  return filter ? lenses.get(filter) : undefined;
}
