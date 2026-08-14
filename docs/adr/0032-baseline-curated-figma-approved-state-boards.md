---
status: accepted
---

# Baseline curated Figma-approved state boards

Visual regression uses one deliberately curated state board per Foundation Component rather than a Cartesian product of every prop. Each board covers the canonical variants, sizes, meaningful interaction states, Light and Dark themes, and any component-specific reduced-motion or overflow condition needed to represent its contract. A board becomes a Chromium screenshot baseline only after manual comparison with its Canonical Design Component; later diffs block accidental change while intentional visual changes follow the visual SemVer policy. Figma Code Connect is not an MVP gate and begins only after the associated API is stable.
