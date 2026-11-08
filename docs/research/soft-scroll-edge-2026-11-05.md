# Shared soft scroll edge, 2026-11-05

The docs header used ScrollEdge soft but added an unmasked 90% background.
Photos used a separate black linear scrim, with no shared progressive blur.
Both now use the shared soft renderer without an unmasked background.

Apple describes soft scroll edges as variable blur fading toward the content:
https://developer.apple.com/design/human-interface-guidelines/scroll-views
The user's iPhone 15 Pro Max, iOS 27.2 Photos library was inspected directly.
This provides visual intent, not access to Apple's private shader.

The shared recipe keeps six filters (0.5, 1, 2, 4, 8, 16 px). Each transition
spans 40% of the edge, with overlapping raised-cosine masks sampled at 17 stops.
The tint has a separate full-extent cosine mask. The outer group has no opacity
or filter so child filters can sample the scrolling backdrop. Hard is unchanged.
Photos supplies a black tint for its white over-image heading through the shared
mask, rather than maintaining a second gradient implementation.

Existing ScrollEdge and Toolbar props do not change. The token presentation
helper softProgressive now accepts (blur, mask); direct internal recipe callers
must pass a CSS mask string. softMask provides the matching tint mask. These
helpers are not public React components. Internal tint variables are documented
in the English and Chinese materials guides.

Verification: 8 package build tasks pass; affected React, tokens, docs and test
package types pass; affected lint/format and source boundary checks pass.
2 focused mask regressions (276 assertions), 8 token tests and the Photos search
DOM regression pass. DOM tests do not establish rendering quality.

Actual Chromium review at 420x800: Photos top edge; shared soft preview top and
bottom in light and dark; short content hides both edges; increased contrast
hides all seven decorative layers. Temporary theme overrides were restored.
The native phone lease was released after reference inspection.

Limitations: no native shader identity, WebKit/Safari rendering proof, exhaustive
contrast audit, horizontal/RTL browser capture or performance qualification.
React Doctor changed-scope scan includes the large existing working tree and
retains the pre-existing ThemeScope cleanup finding; it is not a clean gate for
all repository changes. No commit, landing or release.
