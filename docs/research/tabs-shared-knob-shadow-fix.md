# Shared lifted-knob material repair

November 5, 2026. This fixes shared rendering, not a Photos-specific override.

## Diagnosis and ownership

The held Tabs indicator showed a uniform dark face over a light backdrop. An
in-browser probe kept the optical/color-transfer stages intact and removed only
the final material-shade arithmetic stage: the dark face disappeared. Restoring
that stage restored the defect. The sampled shade image center was RGBA
123/123/123/255; the final compositor combined this opaque gray field across the
entire lifted face rather than confining its effect to an inner shadow.

Toggle and slider knob profiles now keep inner shadows in the existing CSS knob
paint. Their SVG filter retains refraction, contour and material face transfer,
but does not append the opaque material-shade image/composite. Filtered knob CSS
retains the matching inner shadows; the edge contour remains owned by the SVG.
Menu medium/large material shadow processing is unchanged. There is no Photos
color override, forced white fill or disabled Tabs drag/refraction.

The fix lives in packages/glass/src/apple-material.ts and
packages/tokens/src/materials/knob.styles.ts, used by shared KnobMaterial in Tabs,
Switch and Slider. Published consumers require a future normal package release;
this task does not authorize publication.

## Verification

Real browser at390x844: Photos All dragged toward Months retains a light glass
face, and release selects Months with its associated content. The independent
Tabs basic example was also operated without Photos styles: Analytics dragged
toward Reports selects Reports, and ArrowLeft restores Analytics. Screenshots:
tabs-shared-drag-fixed.jpg and tabs-standard-drag-fixed.jpg in this task's local
artifact directory. The diagnostic filter clone and inline probe were removed
by reloading before final validation. Pointer was released and viewport reset.

Six shader regressions cover light/dark toggle-knob, slider-knob and medium
profiles, preventing the shared knob shadow-image stage from returning while
preserving menu processing.11 targeted DOM tests,13 glass tests and installed
consumer exports/types/SSR/assets verification pass. Glass/docs types, affected
oxfmt/oxlint, source boundaries and8-task package build pass. React Doctor remains
59/100 with the existing broad-working-tree diagnostics, not a clean health score.

Dark-mode drag pixels, touch cancellation, Switch/Slider rendered geometry,
WebKit and native-device acceptance remain unverified in this pass. Shader
regressions establish recipe ownership, not browser pixels. No release or commit.
