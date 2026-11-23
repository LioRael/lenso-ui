---
"@lenso/ui": patch
"@lenso/tokens": patch
---

Enable press lift, vertical drag, and spring settling for the vertical TabBar selection indicator while retaining its resting inset and native link navigation.

Vertical TabBars now honor `minimized`, `defaultMinimized`, and `autoMinimize`. Scroll minimization remains off unless enabled; consumers that share a controlled state across layouts can pass `false` in vertical mode to keep the rail expanded.
