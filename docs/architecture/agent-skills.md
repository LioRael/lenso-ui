# Agent integration

Lenso exposes two portable consumer skills, `lenso-ui` and `lenso-ui-design`,
in `.agents/skills`. Contributor setup, preview and landing skills serve this
checkout separately. The former private UI CLI and MCP transports are retired.
Documentation contracts and source-policy checks remain internal build machinery.

## Content structure

The implementation entrypoint establishes the installed project context, routes
component choices and states Lenso-specific API and styling decisions. Focused
references cover direct API lookup, composition, forms, overlays, themes, setup
and debugging. The design entrypoint covers page structure and rendered review,
with portable page patterns for consumers without this checkout.

Installed public declarations establish supported APIs. Matching implementation,
token maps and examples explain behavior. Generated docs remain projections;
they are not a required runtime for skills. Keep source snippets explicitly
distinct from verified browser examples. Both skill folders travel together,
including references, provenance and licenses.

## Upstream comparison

Reviewed on 2026-11-10:

- [shadcn's skill](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/SKILL.md)
  establishes project context, component-selection guidance and concrete API
  rules with linked examples. Its context and documentation retrieval use its
  own CLI. Lenso adopts the organization while resolving package files directly.
- [Vercel React Best Practices](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/SKILL.md)
  exposes a short categorized entrypoint and focused rule files containing
  explanations and examples. Lenso divides references by the task being done
  rather than copying React performance rules into a component skill.
- [The Skills installer](https://github.com/vercel-labs/skills)
  supports selecting skills and target agents. It is an optional distribution
  mechanism; manual host-supported folder installation remains available.

These are organizational references. Retained HeroUI adaptation attribution
and its full license remain with `lenso-ui`; the design skill retains Lenso's
license. No upstream runtime or source installer is embedded in either skill.

## Maintenance and verification

Keep the entrypoints discriminating and move conditional detail to the reference
that owns it. After API changes, update affected examples from actual exports.
Avoid copying the complete API into skills or requiring unrelated tools.

Use the existing skill-copy tests to catch missing references and license loss.
Check frontmatter, docs generation, types and affected regressions. For behavior
review, follow realistic tasks: a profile form, nested dialog, portal theme,
production stylesheet failure or narrow settings screen. Check whether the
instructions reach the owning API and preserve native behavior. Structural
validation alone does not establish that an agent makes better decisions.
