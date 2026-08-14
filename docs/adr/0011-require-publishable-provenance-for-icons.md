---
status: accepted
---

# Require publishable provenance for icons

Public artifacts will not include icons described as exact copies of Linear assets or any other asset without confirmed redistribution rights. Lenso UI uses the ISC-licensed `lucide-react` library for necessary defaults rather than publishing a general-purpose `@lenso/icons` package in the MVP. Only icons used by a component are imported. Every built-in icon is exposed through a replaceable icon slot; Consumers can replace it without recreating the component or changing its interaction semantics, and no Lucide-specific type appears in the Lenso public API.

An undefined slot renders the default, a supplied `ReactNode` replaces it, and `null` removes it. The nearest compound Part owns its icon through children when composition already exposes that Part; convenience surfaces may instead accept `icon?: ReactNode`. A `data-slot="icon"` wrapper owns sizing, alignment, and `currentColor` without requiring the replacement to implement a third-party icon type. Decorative icons are hidden from the accessibility tree, while the host control retains the accessible name and state.
