import type { StyleInput } from "./style-types.js";
import {
  progressBarStyles,
  progressBarColors,
  progressBarTrackSizes,
  progressBarFillSizes,
} from "@lenso/tokens/progress-bar";
import { meterStyles, meterColors, meterTrackSizes, meterFillSizes } from "@lenso/tokens/meter";
import {
  progressCircleStyles,
  progressCircleSizes,
  progressCircleColors,
} from "@lenso/tokens/progress-circle";
import { spinnerStyles, spinnerSizes, spinnerColors } from "@lenso/tokens/spinner";
import { skeletonStyles, skeletonAnimations } from "@lenso/tokens/skeleton";

function sizeOf(data: DOMStringMap) {
  const size = data["lensoSize"];
  if (size === "sm" || size === "md" || size === "lg") return size;
  throw new RangeError(`Unknown Lenso feedback size: ${size}`);
}

function colorOf(data: DOMStringMap) {
  const color = data["lensoColor"];
  if (
    color === "default" ||
    color === "accent" ||
    color === "success" ||
    color === "warning" ||
    color === "danger"
  )
    return color;
  throw new RangeError(`Unknown Lenso feedback color: ${color}`);
}

const presentations = new Map<string, StyleInput>([
  ["progress-bar-label", [progressBarStyles.label]],
  ["progress-bar-output", [progressBarStyles.output]],
  ["meter-label", [meterStyles.label]],
  ["meter-output", [meterStyles.output]],
  ["progress-circle-track-circle", [progressCircleStyles.trackCircle]],
  ["progress-circle-fill-circle", [progressCircleStyles.fillCircle]],
  ["spinner-icon", [spinnerStyles.icon]],
]);

export function feedbackPresentation(kind: string, data: DOMStringMap) {
  const indeterminate = data["lensoIndeterminate"] === "true";
  switch (kind) {
    case "progress-bar":
      return [progressBarStyles.root, progressBarColors[colorOf(data)]];
    case "meter":
      return [meterStyles.root, meterColors[colorOf(data)]];
    case "progress-circle":
      return [progressCircleStyles.root, progressCircleColors[colorOf(data)]];
    case "progress-bar-track":
      return [progressBarStyles.track, progressBarTrackSizes[sizeOf(data)]];
    case "progress-bar-fill":
      return [
        progressBarStyles.fill,
        progressBarFillSizes[sizeOf(data)],
        indeterminate && progressBarStyles.indeterminate,
      ];
    case "meter-track":
      return [meterStyles.track, meterTrackSizes[sizeOf(data)]];
    case "meter-fill":
      return [meterStyles.fill, meterFillSizes[sizeOf(data)]];
    case "progress-circle-track":
      return [
        progressCircleStyles.track,
        progressCircleSizes[sizeOf(data)],
        indeterminate && progressCircleStyles.indeterminate,
      ];
    case "spinner": {
      const size = data["lensoSize"];
      const color = data["lensoColor"];
      if (size !== "sm" && size !== "md" && size !== "lg" && size !== "xl")
        throw new RangeError(`Unknown Lenso Spinner size: ${size}`);
      if (
        color !== "secondary" &&
        color !== "current" &&
        color !== "accent" &&
        color !== "success" &&
        color !== "warning" &&
        color !== "danger"
      )
        throw new RangeError(`Unknown Lenso Spinner color: ${color}`);
      return [spinnerStyles.root, spinnerSizes[size], spinnerColors[color]];
    }
    case "skeleton": {
      const animation = data["skeletonAnimation"];
      if (animation !== "none" && animation !== "pulse" && animation !== "shimmer")
        throw new RangeError(`Unknown Lenso Skeleton animation: ${animation}`);
      return [skeletonStyles.root, skeletonAnimations[animation]];
    }
    default:
      return presentations.get(kind);
  }
}

export const feedbackKinds = [...presentations.keys()].filter(
  (kind) => !kind.startsWith("progress-circle-"),
);
