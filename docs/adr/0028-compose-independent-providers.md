---
status: accepted
---

# Compose independent providers

Lenso UI does not require a global provider that combines unrelated theme, portal, CSP, toast, and motion responsibilities. Consumers compose narrow boundaries such as `ThemeScope`, component-domain providers, and `CSPProvider` only where needed. `@lenso/ui/csp-provider` provides a thin Lenso-owned export of Base UI's nonce and `disableStyleElements` behavior so the certified public surface can document and test strict-CSP integration without inventing different semantics.
