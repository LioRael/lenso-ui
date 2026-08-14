---
status: accepted
---

# Use CSS-first hybrid motion

Lenso UI uses StyleX and CSS for ordinary hover, focus, pressed, color, border, opacity, fixed keyframe, and simple expansion transitions. `@lenso/primitives` never depends on a visual animation runtime. Motion is a bounded optional peer of `@lenso/ui`, used only by subpaths that need gesture velocity, drag or reorder, runtime layout measurement, shared-layout animation, or interruptible presence and sequencing; it remains external to package builds and is installed by registry items only when their source imports it. DialKit remains the authoring surface and is removed after approved parameters are transferred into production CSS or Motion source.

All production motion honors the Consumer's reduced-motion preference. CSS defines reduced branches through `prefers-reduced-motion`; Motion explicitly opts into the user preference, while large displacement, autoplay, and complex sequences provide intentionally designed reduced variants that preserve necessary state feedback rather than merely disabling every transition.
