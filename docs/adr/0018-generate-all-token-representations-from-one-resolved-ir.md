---
status: accepted
---

# Generate all token representations from one resolved IR

A narrow Lenso generator validates vendored, hash-pinned DTCG 2025.10 Format and Resolver schemas, resolves the supported local sets and theme modifier, rejects missing references, cycles, type mismatches, incomplete contexts, and output-name collisions, and produces one deterministic normalized IR. A package-local StyleX variable bridge, public CSS variables and themes, the DTCG semantic contract, a CSS-variable-name manifest, TypeScript semantic-key types, a copyable Consumer adapter template, and the Figma mapping manifest are all generated from that IR rather than interpreted independently or routed through Style Dictionary. These artifacts are data and templates; the project does not add a dedicated Consumer-project mutation CLI.

Figma synchronization is dry-run and diff-only by default. Applying changes requires an explicit command and must read back the resulting variables and styles for verification; unsupported DTCG composites are mapped or split explicitly rather than silently discarded.
