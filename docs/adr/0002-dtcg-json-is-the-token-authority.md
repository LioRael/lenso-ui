---
status: accepted
---

# Use repository DTCG JSON as the token authority

Versioned Design Tokens Community Group 2025.10 Format and Resolver JSON in the repository is the single authority for design-token values, aliases, sets, modifiers, and Light/Dark contexts. The source graph has a private primitive layer and a public semantic layer; components consume semantic tokens directly, and the initial system does not introduce a component-specific token layer. Public CSS custom properties use complete unbranded semantic paths such as `--color-surface-canvas` rather than a Lenso prefix or short global names such as `--background`. StyleX variables, Figma Variables, documentation, and other representations are generated or validated from that authority; Figma is an editable design and visual-approval surface, not a second writable source of truth.
