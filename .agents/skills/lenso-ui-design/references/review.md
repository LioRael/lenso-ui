# Rendered review

Serve the actual built application when delivery or production styling is part
of the change. Capture candidate and reference with matching viewport, theme,
direction and state. Wait for fonts and overlays to settle; use reduced motion
or disabled screenshot animations for stable geometry.

Compare frame and pane boundaries first, then information density, type and
spacing, then surfaces/icons/focus treatment. Record discrepancies with their
location and cause. Fix the shared rule when several pages show the same error.
Avoid a pixel-diff claim when the reference, fonts or content do not match.

For each affected page, review:

- Initial desktop and narrow layout.
- Light/dark surfaces and edited accent/font/radius where relevant.
- A selected/open state and keyboard focus.
- Reachable empty/invalid content and overflow/scrolling ownership.
- RTL and reduced motion when supported by the surrounding application.

Run behavior checks separately: native selection, form validation, dismissal,
focus restoration and theme propagation into portals. Geometry assertions
complement screenshots; screenshots complement typecheck/lint/build. Neither
alone proves the other axis.

Deliver a small evidence table identifying pages, viewports/states, comparison
status and unresolved differences. State when color contrast was not checked or
when exact source values fail it. Leave missing evidence visible rather than
converting a draft or unavailable reference into an approval.
