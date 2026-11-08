# Prominent GlassButton visibility

The foreground-contour opacity condition contained a top-level selector list
inside `::after`. StyleX appended the pseudo-element to only the last branch.
The first generated branch matched the actual host:

```css
.x...[data-material-filter]:not([data-lenso-glass-foreground-rim]), ...::after {
  opacity: 0;
}
```

Prominent controls use the colored material recipe and deliberately do not have
the untinted foreground-rim marker. Once their filter attached, this branch hid
the entire button, including its text. Default controls with the foreground marker
escaped it, which is why earlier untinted material checks did not catch the bug.
The rendered Chromium regression failed with host opacity 0 instead of 1.

The state alternatives now live inside a single `:is(...)`, so the opacity rule
remains scoped to `::after`. No host opacity override or forced visible styling
was added; caller styles and disabled semantics remain native.

The expanded browser check also exposed a WebKit fallback case. Without a
marked backdrop, colored buttons use their CSS tint layer. At the clear global
appearance endpoint, the generic preference selector hid that layer even though
no SVG tint replaced it. Its sampled fill was `(254,254,254)` with white ink.
Prominent/filled variants now retain their colored CSS layer when preferences
are active; the existing filter/copy ownership still suppresses it when a real
optical renderer owns the face.

`glass-prominent.mjs` checks actual rendered host opacity, visibility and
saturated fill for ordinary prominent, destructive, custom-tint and disabled
controls at tint 0 / 0.5 / 1, in both appearances and Chromium/WebKit. It also
checks focus visibility and host opacity through a press. The fixture renders
the real English Basic demo alongside custom/disabled controls. The initial
wait accepts the CSS/rim-only fallback rather than requiring a filter that
WebKit intentionally cannot use without a source.

Package build, affected token types, lint/format and installed-consumer
production acceptance accompany the browser matrix. The normal 3000 preview
was also checked after the selector correction: all four prominent hosts had
opacity 1. This is targeted component regression coverage, not a native-device
or full-site visual acceptance result.

All 12 Chromium/WebKit × light/dark × tint 0/0.5/1 scenarios passed, including the CSS-only fallback. Token types, affected lint/format, all 8 package build tasks and installed-consumer acceptance passed.
