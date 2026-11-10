# Native implementation notices

Android rendering (`BackdropView.kt`, `Backdrops.kt`, `GlassView.kt`,
`GlassGroupView.kt`, `GlassShader.kt`, `Shapes.kt`) and iOS UIKit hosting
(`ControlView.swift`) retain or adapt source from
[onlymoein/liquidglass](https://github.com/onlymoein/liquidglass/tree/a2d26488ce8656901d088d10a69ec4e82fca37f4/native),
commit `a2d26488ce8656901d088d10a69ec4e82fca37f4`.

Copyright (c) 2026 Kelvin Zhang and Moein Saharkhiz. Licensed under the MIT License;
the full license is retained in this directory's LICENSE file.

Adaptations include explicit backdrop IDs, detach cleanup, compatible fusion
membership, floating-point geometry keys, cached shaders, shared Lenso tone data,
Snell refraction, corrected shadow calls and change-driven native control measurement.

`LensoTone.kt` is generated from Lenso's existing MIT material-tone source.
`src/use-press.ts` consumes the existing Lenso shared spring model. See the root
THIRD_PARTY_NOTICES.md and packages/glass notices for the original material and
motion provenance. The package is private and has not been prepared for publication.
