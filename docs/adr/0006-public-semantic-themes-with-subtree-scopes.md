---
status: accepted
---

# Provide public semantic themes with subtree scopes

Lenso UI will ship complete default themes and let consumers override the public semantic token layer within any interface subtree, including independent light and dark scopes. A Theme definition is complete and fails generation when any required semantic token is absent; a nested `overrides` value may be partial and inherits missing values from the nearest scope. Without a Theme Scope, the official default Theme applies.

A Portal with an explicit `container` honors that Consumer value; otherwise it renders into the nearest Theme Scope's body-level host, falling back to `document.body` only when no scope exists. Nested scopes use the nearest host. A host synchronizes only the active mode and semantic overrides, not application DOM, and keeps overlays outside subtree clipping and stacking contexts. Primitive palettes and component-to-token mappings remain implementation details; product-level preference persistence, theme assets, composition, installation, and recovery remain owned by consumers such as Lenso Console rather than by Lenso UI.
