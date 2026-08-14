---
status: accepted
---

# Pin the repository toolchain and release inputs

The monorepo develops and publishes with Node 24 LTS and the exact pnpm 11.5 release recorded by the root `packageManager` field. Public browser packages do not add an artificial Node engine constraint. TypeScript 7 runs with strict, verbatim module, isolated declaration, exact optional property, unchecked index, and bundler-resolution checks while emitted declarations avoid unnecessary syntax that would exclude reasonable downstream TypeScript versions.

Vitest 4 is the single test runner: Node projects cover generators and manifests, while Browser Mode with the Playwright provider covers component behavior and curated Chromium state boards. The repository does not add framework smoke projects, Jest, or jsdom. Oxfmt and Oxlint provide formatting and static checks without ESLint, Prettier, or Ultracite; one root `pnpm check` command lets Turborepo schedule the affected format check, lint, typecheck, test, and build tasks.

Dependencies capable of changing visual output, behavior, schema interpretation, or generated artifacts are pinned as Release Snapshot inputs. `lucide-react` is an exact `@lenso/ui` dependency, `@lenso/ui` uses the matching exact `@lenso/tokens` version, and registry artifacts record exact Base UI, Lucide, and conditional Motion versions. StyleX, tsdown, token schemas, and registry schemas are exact root-catalog entries. React and Base UI remain bounded npm peer ranges where host ownership is required.
