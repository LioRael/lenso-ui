import { maps, type Shape, type OpticalFields } from "./optical-fields.js";
import { fusionGeometry } from "./fusion-geometry.js";
import type { FusionShape } from "./fusion.js";

export interface FusionFieldInput {
  width: number;
  height: number;
  shapes: FusionShape[];
  spacing: number;
  grouped: boolean;
  shape: Shape;
  unified: boolean;
}

export function fusionFields(input: FusionFieldInput) {
  return maps(
    input.width,
    input.height,
    0,
    false,
    input.shape,
    fusionGeometry(input.shapes, input.spacing, input.grouped),
    false,
    { rim: !input.unified, contour: !input.unified, silhouette: false },
  );
}

export type FusionFields = OpticalFields & {
  accelerated?: boolean;
  precisionCorrections?: number;
};
export type FusionFieldReply =
  | { fields: FusionFields; error?: never }
  | { error: string; fields?: never };
