"use client";
import * as stylex from "@stylexjs/stylex";
import { tabsStyles as s } from "@lenso/tokens/tabs";
import { materialStyles } from "@lenso/tokens/materials";
import { glassStyles } from "@lenso/tokens/glass";
import { KnobMaterial } from "./materials/knob.js";
import { MaterialBackground } from "./materials/render.js";

export type SegmentedPresentationKind = "tabs" | "segmented-control";

export function SelectionTrack({
  kind,
  glass,
}: {
  kind: SegmentedPresentationKind;
  glass: boolean;
}) {
  return (
    <span
      data-lenso-slot={`${kind}-glass`}
      data-material={glass ? "glass-small" : undefined}
      aria-hidden="true"
      {...stylex.props(
        glass && materialStyles.root,
        glass && materialStyles.accessible,
        s.glass,
        !glass && s.plain,
      )}
    >
      {glass && <MaterialBackground variant="glass-small" />}
    </span>
  );
}

export function SelectionHighlight({
  kind,
  vertical = false,
}: {
  kind: SegmentedPresentationKind;
  vertical?: boolean;
}) {
  return (
    <span
      data-lenso-slot={`${kind}-tint`}
      aria-hidden="true"
      inert
      {...stylex.props(s.tint, s.initialIndicator)}
    >
      <span data-lenso-slot={`${kind}-highlight-ring`} {...stylex.props(s.highlightClip)}>
        <span data-lenso-slot={`${kind}-highlight-optics`} {...stylex.props(s.highlightOptics)}>
          <span
            data-lenso-slot={`${kind}-row`}
            {...stylex.props(s.row, vertical && s.rowVertical)}
          />
        </span>
      </span>
      <span data-lenso-slot={`${kind}-highlight-centre`} {...stylex.props(s.highlightClip)}>
        <span
          data-lenso-slot={`${kind}-centre-row`}
          {...stylex.props(s.row, vertical && s.rowVertical)}
        />
      </span>
    </span>
  );
}

export function SelectionLensPaint({ kind }: { kind: SegmentedPresentationKind }) {
  return (
    <span
      data-lenso-slot={`${kind}-refraction`}
      // Sample the composited track, not a fresh copy of the page's marked photo.
      data-lenso-backdrop="live"
      aria-hidden="true"
      {...stylex.props(s.refraction)}
    >
      <KnobMaterial kind="toggle" controlEdge />
    </span>
  );
}

export function SelectionFallback({ kind }: { kind: SegmentedPresentationKind }) {
  return (
    <span
      aria-hidden="true"
      inert
      data-lenso-slot={`${kind}-fallback`}
      data-lg-tabs-lens="fallback"
      {...stylex.props(s.indicator, glassStyles.hotspot, s.lens, s.fallback, s.initialIndicator)}
    >
      <SelectionLensPaint kind={kind} />
    </span>
  );
}
