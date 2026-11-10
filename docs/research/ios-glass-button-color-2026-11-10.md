# iOS native Glass button title-color investigation — 2026-11-10

Versioned screenshots, drivers, pixel matrices and build receipts are indexed in
the [retained evidence](evidence/native-glass-2026-11-10/README.md). Original
`output/` and `/tmp/` paths below describe the historical capture environment.

## Scope and reproduction

Continue the title-color issue without replacing UIKit `.prominentGlass()` or
adding a custom text overlay. The previous runtime report established cyan pixels
in the installed application, but did not establish their cause. Its description
as a system limitation was premature.

The baseline is the actual Expo Debug application on iPhone 17 Pro / iOS 26.5,
built with the iOS 27.2 SDK. A representative foreground pixel was
RGB(139,255,255) even after explicit white base foreground and title attributes.
The native screenshot and callback checks must be repeated against the final
installed binary; a passing Swift build alone does not resolve the issue.

## Upstream comparison

Reviewed upstream main at
[`78a93d141bde5bf8b3f0792397ff17c819b3b38c`](https://github.com/onlymoein/liquidglass/blob/78a93d141bde5bf8b3f0792397ff17c819b3b38c/native/ios/ControlView.swift).
Its filled button uses `.prominentGlass()`, preserves the preset foreground and
only assigns `baseBackgroundColor` when a custom tint exists. It then assigns the
button's `tintColor`, including nil to restore inherited tint. Its title-attributes
transformer changes color only for an unfilled tinted/destructive button.

The upstream
[`6a8b66e` destructive-color fix](https://github.com/onlymoein/liquidglass/commit/6a8b66e61723517e54b8bae6ddf5ee920d36624d)
also applies only to unfilled buttons. It is not evidence that forcing the
prominent title white fixes the composited result.

Our previous implementation differed by assigning the prominent foreground white,
assigning a nil background, and later adding a white title transformer. It never
updated `button.tintColor`. These differences require rendered comparison.

Apple documents
[`prominentGlass()`](https://developer.apple.com/documentation/UIKit/UIButton/Configuration-swift.struct/prominentGlass%28%29)
as the native prominent Glass style. The installed public UIKit headers say that
base colors may be modified before application and that nil permits the style to
choose its own colors. This does not prove the cause of the observed cyan pixels.

## Ranked hypotheses

1. Foreground/title overrides interfere with native preset behavior. Compare our
   current configuration with a pristine preset and upstream's configuration.
2. Inherited tint affects the composited title. Compare explicit blue and white
   button tint while independently retaining a blue base background.
3. React Native hosting changes compositing. Run the same public configurations
   in a separate UIKit application on the same simulator and backdrop.

Only one configuration variable should change per comparison. Preserve settled
screenshots and runtime colors, and distinguish label attributes from final pixels.

## Compiler finding

The minimal public-UIKit probe exposed a fourth hypothesis: ambiguous attributed
text scope. With this installed SDK/compiler, the expression
`outgoing.foregroundColor = .white` resolves to
`AttributeScopes.SwiftUIAttributes.ForegroundColorAttribute`, whose value is a
SwiftUI Color. This was confirmed independently by `swiftc -typecheck -dump-ast`
against the iOS Simulator 27.2 SDK, not inferred from appearance.

`outgoing.uiKit.foregroundColor = UIColor.white` instead resolves to
`AttributeScopes.UIKitAttributes.ForegroundColorAttribute`. The old transformer
therefore did not provide the UIKit foreground attribute it intended to provide.
The explicit UIKit scope also avoids an accidental SwiftUI dependency in the
standalone UIKit probe. The compiler input and AST are retained with the evidence.

Candidate A removes the prominent overrides and follows upstream's conditional
color assignments. Candidate B additionally supplies white through the explicit
UIKit title scope, while retaining `.prominentGlass()` and normal UIKit ownership
of the title, hit testing and press rendering. Neither candidate uses a title
overlay or changes private view/layer properties.

Both installed candidates still fail the neutral-white title pixel check in two
settled captures each: 1,902 cyan core pixels, zero neutral-white pixels, with
dominant RGB(139,255,255) in 1,275 pixels. The baseline matches exactly. Fixing the
attribute scope is therefore insufficient to explain or resolve the composited
color. An actual opaque `.filled` capture passes the same classifier (90.4%
neutral-white core pixels), serving as a positive control.

## Standalone UIKit comparison

A separate UIKit application (`dev.lenso.glasscolordiff`) was built and installed
on the same simulator. It does not load React Native, Expo or Lenso. Seven cases
share an identical backdrop and the title Continue:

| Case | Public configuration                        | Observed result |
| ---- | ------------------------------------------- | --------------- |
| A    | Pristine `.prominentGlass()`                | Cyan title      |
| B    | Explicit UIKit white title transformer      | Cyan title      |
| C    | Upstream preset with nil button tint        | Cyan title      |
| D    | White button tint with blue base background | Cyan title      |
| E    | Explicit UIKit white attributed title       | Cyan title      |
| F    | Upstream preset with explicit blue tint     | Cyan title      |
| G    | White base foreground only                  | Cyan title      |

The settled runtime log reports white (`1,1,1,1`) for every `titleLabel.textColor`
and `isHighlighted=false`. Case D resolves its button tint to white; the remaining
cases use system blue. Thus neither a missing white attribute nor React Native
hosting is necessary to reproduce the final cyan pixels. Screenshots and runtime
colors establish this behavior on the tested iOS 26.5 simulator; they do not prove
that every iOS release or real device renders it identically.

A final bounded public-API batch compared five additional cases in light/dark:

| Case | Public configuration                                                           | Observed result                                                          |
| ---- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| H    | `.prominentGlass()` plus `setTitleColor(.white)`                               | Cyan title                                                               |
| I    | `.prominentGlass()` plus public title-label color in the configuration updater | Cyan title                                                               |
| J    | `.prominentClearGlass()` with UIKit white attributes                           | White title; transparent, unfilled appearance                            |
| K    | `.glass()` with blue base background and UIKit white attributes                | White title; blue base background does not produce a prominent blue fill |
| L    | `.prominentGlass()` with blue background configuration                         | Cyan title; different blue fill                                          |

J passes the neutral-white check at 94.6% in light and 96.9% in dark; K at 83.8%
in both. These controls prove that native Glass can render white text in this
environment. They do not fix the same prominent blue appearance: changing styles
also changes the material. Neither was substituted silently for the prominent
variant. H, I and L retain cyan pixels despite public white-title assignments.

## Retained implementation and conclusion

Keep the native `.prominentGlass()` implementation and upstream's conditional
color configuration. Remove the ineffective prominent white-title overrides.
Custom tint/destructive colors on ordinary Glass buttons use explicit UIKit
title attributes, and `button.tintColor` is updated/reset with the supplied tint.
The title, material, hit testing and press feedback remain owned by UIKit.

The prominent title has **not** been fixed to white. The supported conclusion is
narrower than a universal system limitation: on this iOS 26.5 simulator, a pristine
UIKit prominent Glass button and the upstream configuration reproduce the same
cyan composited title, even when the native title's color property is white.
Neither RN hosting nor our initial overrides are required to reproduce it.
Other native Glass styles can render white but change the prominent appearance.
No private layer changes, custom title overlay or opaque replacement was adopted.

The retained source passed a complete iOS native Debug build. The first final
sanity attempt used a stale temporary test label (`Use opaque surfaces`); it is
excluded. The second ran the prior standalone probe scenario rather than the
requested Lenso scenario and is also excluded. The authoritative
`final-default-sanity3` run used fresh QA build products and passed against the
actual Lenso application: Actions 1 → 2 exactly once, light → dark → Reduce
transparency → Restore transparency → light. Installed app and test-runner hashes
match their respective final build products. Final light/dark title pixel checks
still fail neutral-white; dark opaque is a positive control at 90.44% white.
An interaction pass does not convert the cyan pixel check into a pass. The app was
restored to light appearance with transparency enabled.

Only iOS 26.5 is installed locally. Other OS runtimes and physical devices have
not been compared, so cross-version/device behavior and Apple's intended internal
compositing mechanism remain unproven.

## Evidence

- `output/native-glass-2026-11-10/ios/button-color-investigation/`: upstream source,
  compiler input/AST and final full-native build log.
- `output/native-glass-2026-11-10/ios/color-diagnosis/`: reproducible pixel classifier,
  baseline/candidate captures, standalone probe source, runtime colors, per-case
  pixel matrices and final actual-app interaction results.

The classifier operates on the actual AX title frame and checks neutral-white
versus cyan core pixels. Its threshold is a local color regression signal, not a
complete contrast/accessibility certification.
