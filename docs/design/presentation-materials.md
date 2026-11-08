# Presentation materials

The supplied iOS 27 Figma file is the reference for material selection. Component
names, modal interaction and an overlay's screen position do not select its
material by themselves. Use the referenced surface and its current presentation
state. Geometry and interaction remain separate contracts.

## Reference map

| Surface/state                                  | Default material                                     | Reference and boundary                                                                                                                                 |
| ---------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Modal content; side Drawer; desktop Sheet      | Solid, light primary/dark secondary                  | Sheet - iPad `5719:30145` has an opaque fill and a 15/75/.18 shadow. Modal and side Drawer are Lenso mappings of that content-frame role.              |
| Popover body and default arrow                 | Thick frosted material                               | `61:65422`: body `513:95250` and arrow `5433:21565` both reference `510:79108` (Thick).                                                                |
| Tooltip body and default arrow                 | Same Thick frosted material                          | Web-only contextual-text extension of the anchored surface. No Tooltip master was found in this archive; native Tooltip parity is not claimed.         |
| AlertDialog and ActionSheet                    | Medium Glass                                         | Alert example `13159:44659` and ActionSheet examples `12740:35185` / `12740:37603` resolve to Glass Effect `10411:18582`.                              |
| Menu                                           | Medium Glass                                         | Retains the existing menu reference/material mapping; shares the compact panel profile, with its own interaction and motion.                           |
| Partially presented mobile Sheet               | Medium Glass                                         | Sheet - Duo/Medium `12887:15603` resolves to the same Glass Effect `10411:18582`.                                                                      |
| Expanded mobile Sheet; default full ShareSheet | Solid content, with the existing adaptive transition | Large (Stacked) `12887:15623` and iPhone Activity View `13112:5166` have opaque body fills. ShareSheet composes Sheet and defaults to the full detent. |

These are material-family mappings, not claims that a browser reproduces native
refraction, dimensions or every fill equation exactly. The Figma archive was
read locally without modification. Record IDs establish the specific reference;
old hidden variants are not the default authority.

The iPad Activity View example uses a Thick Popover (`61:65428`) around sharing
content. Lenso's current ShareSheet is an unanchored Sheet composition, including
on desktop. It does not implement that anchored iPad presentation. Changing only
its material would not establish parity; that distinct presentation remains a
separate implementation gap. Custom partial ShareSheet detents follow the shared
Sheet policy rather than claiming a separate native Activity View variant.

Toast and Notification retain their existing, distinct profiles: ordinary glass
Toast uses Small Glass, pill Toast uses Medium Glass, and Notification uses Clear
Glass. Toast is a Web feedback composition, not a native Notification alias.
Non-glass status variants retain their ordinary semantic surfaces. The earlier
Toast documentation incorrectly described its ordinary glass variant as Clear;
that wording now matches the implementation.

## Composition rules

- Solid content, frosted material and refractive Glass are distinct roles. Keep
  matching roles on the same existing recipe instead of tuning opacity or blur
  independently on each component.
- Default anchored arrows and bodies form one material silhouette. Positioning,
  zooming and resizing must not create a separate paint copy or a second blur
  pass. Custom arrow content retains caller-owned presentation.
- A solid content frame may contain Glass navigation controls: the iPad Sheet
  reference itself includes those separate floating controls. Ordinary form and
  footer actions use ordinary Button peers; do not infer their material from the
  panel behind them.
- Sheet material follows its existing viewport/detent presentation. Preserve the
  continuous glass-to-solid transition instead of switching material by name or
  remounting its content. Desktop content remains solid.
- Backdrop variants choose dimming/blur behind the panel, not the panel's material.
- Legacy up/down Drawer remains a generic content frame. Bottom alignment alone
  does not make a presentation a detented Sheet; choose Sheet for that behavior.
- Increased contrast, reduced transparency and forced colors may replace material
  effects with opaque, legible surfaces. Those are accessibility states.

## Ownership

`packages/ui/src/utils/materials/presentation.ts` selects the existing recipes
for anchored, compact and partially presented Sheet roles. The solid content
frame's color/geometry constants live in
`packages/tokens/src/shared/presentation.stylex.const.ts`. Sheet's native state
and CSS own its adaptive transition. No new public material prop or Dialog alias
is introduced.

`AnchoredMaterial` owns the shared backdrop and silhouette for Popover/Tooltip;
each retains its own arrow curve and native Base UI placement. Existing material
engines own appearance, accessibility and glass preferences. Global Glass tint
preferences affect Glass recipes; they do not turn solid content or ordinary
Thick frost into refractive Glass.
