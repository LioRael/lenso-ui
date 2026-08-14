---
status: accepted
---

# Use an unbranded semantic CSS contract

Public CSS custom properties omit a Lenso brand prefix so adopters can treat the semantic layer as their own design-system contract. Names retain the complete category and semantic path, for example `--color-surface-canvas`, `--color-content-primary`, and `--motion-duration-fast`; short global names such as `--background`, `--primary`, and `--muted` are prohibited. This deliberately accepts that Lenso UI cannot guarantee collision-free coexistence with another design system defining the same complete names inside one Theme Scope. Registry owners may rename their copy, but renamed source is a Consumer fork rather than an official cross-channel upgrade contract.
