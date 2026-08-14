---
status: accepted
---

# Support registry and package distribution

Lenso UI will provide both shadcn-compatible source distribution and precompiled package distribution as first-class delivery channels. Package releases contain precompiled JavaScript, types, and one explicitly imported `@lenso/ui/styles.css`; consumers do not require a StyleX compiler, and component JavaScript does not inject CSS as a side effect. Registry releases contain editable TypeScript and StyleX source and do require a compatible consumer-side compiler. A framework-aware registry setup item may generate configuration for a clean project, but an accompanying validator must stop and present an exact manual change when existing build configuration cannot be merged safely. This deliberately accepts the additional parity, versioning, documentation, and testing cost so consumers can choose source ownership or managed package upgrades without changing design systems.
