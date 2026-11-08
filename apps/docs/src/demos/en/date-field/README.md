# DateField and TimeField examples

These runnable examples demonstrate the current Lenso UI date and time fields.
The documentation registry in `src/demos/live-manifest.json` identifies their
public placements; the local `.tsx` modules are the source shown to readers.

The examples use Lenso's field composition and `@internationalized/date` value
models. They include controlled values, validation, form submission, time
precision, and caller-supplied render functions. The shared English and Chinese
examples are maintained independently where their text differs.

Retained adaptations keep their Apache-2.0 terms and Copyright NextUI Inc.; see
[`THIRD_PARTY_NOTICES.md`](../../../../../../THIRD_PARTY_NOTICES.md).

The component DOM regressions live with `packages/ui/test`; follow
`CONTRIBUTING.md` for the current verification commands. These tests exercise
semantics and interaction in Bun DOM. Browser rendering and geometry require
the maintained docs browser checks. Historical screenshots do not establish
current behavior.
