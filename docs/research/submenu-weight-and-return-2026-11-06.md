# Submenu weight and return motion

This follow-up restores semibold headings at the user's request and completes
the previously blocked rendered acceptance. It changes the shared Menu layer,
without a Photos-specific workaround or a new public API.

## Corrections

- The real heading remains visible throughout the morph. Its weight follows
  the same interruptible progress as its position, using a smoothstep from the
  source row's computed weight to the heading's computed weight. With the
  default styles this is 400 to 600, reversed on return. Reduced motion reaches
  the final weight directly. There is no delayed bold toggle or glyph clone.
- Heading scale now follows the parent's actual scale instead of the ratio of
  row widths. Previously a 218px parent row and 206px child row stretched the
  glyphs horizontally even though both used the same font size.
- Stacked navigation and menu feedback release use critical damping. The press
  response remains elastic, while release avoids a second oscillation.
- Cross-submenu testing exposed a separate ownership race: one sibling restored
  the parent while another was open, and the newer sibling later restored the
  already dimmed snapshot. This left parent opacity around 0.939 and pointer
  events disabled. Children now share parent motion ownership; the last child
  restores the original scale, opacity, origins and interaction state.

Base UI continues to own activation, focus, dismissal and unmount semantics.
The shared convention is recorded in `docs/design/component-conventions.md`.

## Rendered evidence

Environment: local Docs development preview at `/en/photos`, Chromium in-app
browser, English, LTR, 589 by 795 viewport. Normal pointer opening/return,
keyboard rapid reversal, sibling switching and reduced motion were exercised
in both appearances. At 1024 by 795, the automatic presentation remained a
cascading submenu without a stacked heading. Escape returned focus to the
Sort and filter trigger. No native-device parity or Safari acceptance is claimed.

The final captures combine requestAnimationFrame geometry, computed weight,
element identity and opacity with actual CDP screencast images. The screenshots
are sampled rendered frames, not a claim of a complete video or performance
benchmark. Frame sheets were inspected for title disappearance, duplicated
heading glyphs, endpoint changes and return bounce.

| Final case                    | Geometry frames | Rendered images | Result                                                            |
| ----------------------------- | --------------: | --------------: | ----------------------------------------------------------------- |
| Light open                    |             112 |              52 | One real title, weight increases to 600, no weight reversal       |
| Light close                   |             123 |              57 | Weight returns to 400; no reverse Y movement during return        |
| Dark open                     |             103 |              51 | One real title, weight increases to 600, no weight reversal       |
| Dark close                    |             123 |              46 | Weight returns to 400; no reverse Y movement during return        |
| Light rapid reverse           |              83 |              46 | Three interrupted open/close cycles retain the same title element |
| Dark rapid reverse            |              79 |              55 | Same result; parent state restores                                |
| Light sibling switch / return |       109 / 131 |         57 / 48 | Parent restores after last child; focus returns to source         |
| Dark sibling switch / return  |       100 / 143 |         58 / 59 | Same result                                                       |
| Light reduced motion          |             154 |              41 | Final geometry and weight directly; opening and return work       |
| Dark reduced motion           |             155 |              37 | Same result                                                       |

Rapid reversals used approximately 80ms open and 65ms return intervals. Sibling
switches opened the other submenu 70ms into return. No final trace contained a
glyph clone or a frame where an existing heading and its matching source were
both hidden. The last visible return frame differed from the source text by
0px horizontally and less than 0.011px vertically; text width and height matched.
These are measurements of the recorded states, not a universal no-flash guarantee.

Evidence directory: `.artifacts/submenu-title-2026-11-06/`. The `final-*.json`
files contain per-frame data and screenshot metadata; `metrics.json` summarizes
the checks. `final-*-sheet.jpg` contains representative rendered frames.

The browser connection timed out during an additional final screenshot attempt,
after the above captures had completed. The viewport override was reset and the
temporary tab closed. The original user tab was preserved. Earlier malformed
screenshots taken before viewport calibration are excluded from acceptance.

## Automated verification

- Affected formatting, lint and interaction source boundaries passed.
- Tokens and UI builds passed, in dependency order.
- UI, testing and Docs typechecks passed.
- Focused component regressions: 21 passed, 0 failed. The submenu regression
  additionally checks intermediate weights, no row-width glyph stretching,
  monotonic return weight and overlapping sibling restoration.
- Existing Photos regressions: 10 passed, 0 failed.
- Installed package consumer exports, types, SSR and production assets: passed.

DOM tests complement the rendered evidence; they do not establish browser glyph
rendering or layout. No full-site audit, production deployment, publication or
merge was performed. Chinese, RTL, larger text and Safari remain outside this
focused rendered cohort. Colors and material recipes were retained; a new
contrast certification was not performed.

## Scoped antislop delivery gate

Direction: retain the existing Apple Photos reconstruction and shared Menu
hierarchy. ENERGY / RHYTHM / MOTION are unchanged from the existing interface;
this correction removes unwanted oscillation and makes state changes continuous.

- Hard gate, R-26/R-33/R-35 PASS: authored shared source, built packages, exercised
  the affected controls in the running preview and retained frame evidence.
- Adaptation and interaction, R-03/R-32/R-34 PASS for the recorded cohort: light,
  dark, narrow stacked, desktop cascade, normal/reduced motion, keyboard return,
  interrupted transitions and sibling recovery were checked. This is not a
  claim of broader language, accessibility or contrast certification.
- Purpose gate, R-19/R-31 PASS: movement preserves the source-to-child
  relationship; weight indicates hierarchy; critical damping prevents an
  unintended second motion. No decorative effects or assets were added.
- Liveliness and consistency PASS for this correction: established menu content,
  spacing, colors and material roles are retained; the shared heading and return
  rules apply to both View Options and Media Types.
- C-1/C-2/C-4/C-5 PASS within scope: decisions have the above purpose, controls
  remain functional, the recorded state cohort restores correctly, and claims
  are limited to saved evidence. No copy, navigation or invented content was added.
