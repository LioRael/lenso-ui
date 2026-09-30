---
name: land
description: >-
  Land an explicitly requested Lenso UI change through its signed,
  exact-candidate-SHA workflow. Invoke only when the user requests landing
  or merging, including an explicit /land invocation; not for review,
  preparation, passing checks, or skill installation alone.
metadata:
  delta-action: land
---

# Land Lenso UI changes

This restores the existing `land` workflow, adapting its verification to the
source reconstruction. Preserve its callable invocation setting. An explicit
landing request authorizes the workflow below: proceed without asking again
whether to merge. Installation approval alone is not a landing request.

## Scope and safeguards

- Work in the attached Lenso UI Delta worktree, never the `local` remote's
  primary checkout. Confirm `origin` still identifies
  `https://github.com/LioRael/lenso-ui.git` and that `main` remains the intended
  destination. Do not use `local` to publish.
- Read applicable `AGENTS.md`, `DESIGN.md`, contribution policies, templates,
  and relevant package instructions. Follow the reconstruction authority;
  preserve `packages/primitives` byte-for-byte.
- Inspect staged, unstaged, untracked, and already committed changes. Include
  only the requested change and its required artifacts. Do not blindly stage
  the entire reconstruction when a smaller change was requested.
- Preserve unrelated work. Never use a force push, `git reset --hard`,
  `git clean`, signing bypass, or `--no-verify`. Stop if scope cannot be
  separated safely.
- Preserve configured commit signing; this repository currently uses SSH
  signing. A missing signer is a blocker, not permission to disable signing.
- Do not publish packages, create release tags, approve protected environments,
  or invoke deployment manually. Do not change protections or workflows simply
  to make landing pass.

## Preflight and policy gate

Inspect remotes, Git status, history, current hosting settings, and the proposed
destination before committing or publishing:

```sh
git remote -v
git --no-optional-locks status --short --branch
git diff
git diff --cached
gh api repos/LioRael/lenso-ui --jq '{default_branch,permissions}'
gh api repos/LioRael/lenso-ui/branches/main --jq '{name,protected}'
gh api repos/LioRael/lenso-ui/rulesets
```

These are standard Git/GitHub CLI operations, not repository task scripts.
Recheck authentication without displaying tokens or credential values.
At setup, `main` was unprotected, with no rulesets, and direct candidate-gated
landing was already established. Those observations are not permanent policy:
if reviews, checks, or a merge queue are now required, satisfy them. Do not
bypass them with a direct push. If their workflow cannot be established safely,
report the blocker and stop.

Use Node **24.18.0** and pnpm **11.5.0**. Verify executable versions, not merely
their presence. The active shell may otherwise use Node 26. An installed
matching runtime may be selected without installing tools or changing shared
configuration. Stop if the required runtime is unavailable.
Sources: `.mise.toml` (`tools.node`), `package.json` (`engines.node`,
`packageManager`), and the candidate's actual CI configuration.

Carry explicit contribution obligations forward:

- Require applicable tests, documentation, generated-artifact consistency,
  upstream licenses, and adaptation notices.
- Require migration notes for changed consumer imports, CSS, APIs or behavior;
  record themes/states for material visual changes.
- The base repository's `CONTRIBUTING.md` requires Changesets for public API,
  semantic token, registry or material visual-contract changes. For ordinary
  changes under that policy, require the relevant Changeset. Do not invent a
  version or manually change release state.
- This reconstruction deletes that policy, Changesets tooling and release
  infrastructure. Do not interpret deletion as automatic waiver. Require an
  explicit approved replacement contribution/release policy before landing
  such a reconstruction. If still unresolved, stop and explain what needs a
  decision; do not prescribe the removed `pnpm changeset` command.
- Apply any new signing, contributor agreement, review, submission-text,
  first-contribution, or feature-specific requirements only under their stated
  conditions. When human-authored text is required, obtain it rather than
  substituting generated text plus approval.

Sources: the destination/base `CONTRIBUTING.md`, especially “Changesets and
public changes” and “Verification”; current `AGENTS.md` and `DESIGN.md`.
Technical references to the removed package graph are obsolete, but explicit
contribution obligations are not silently discarded.

## Mandatory candidate CI gate

Before pushing any candidate, inspect the actual candidate workflow and its
definitions. It must support a push on `delta/verify/**`, perform the required
checks for that exact SHA, and exclude main-only deployment/publication effects.
Use an explicitly approved successor workflow if the original is replaced;
derive the workflow name and required jobs from that file, not an assumed name.

The previous authoritative definition is `.github/workflows/ci.yml`: `CI`,
push branches `main` and `delta/verify/**`, with required job `verify`.
The current reconstruction deletes it; the replacement
`.github/workflows/verify.yml` was empty at setup. **That state is not
landable.** A missing, empty, disabled, or candidate-ineligible workflow blocks
landing. Do not recreate CI or weaken the gate as part of executing this skill.

Inspect deployment/release side effects in the candidate and destination.
The former `.github/workflows/release.yml` used a protected `npm` environment
after successful main CI, and CI deployed docs only on main. If the user has
prohibited deployment/publication and a main push would cause it, stop before
that push and report the conflict. Do not approve the release environment.

## Review and local verification

1. Review the complete intended diff, including new files and deletions.
   Obtain the final Delta Review verdict or the project's required review for
   the current revision. Resolve required findings; repeat review after fixes.
   A prior worker's review or build of another SHA is not evidence for this
   candidate.
2. Install dependencies from the lockfile when needed, using:

   ```sh
   pnpm install --frozen-lockfile
   ```

   Source: the base `.github/workflows/ci.yml` install step; revalidate the
   successor's install mode and lockfile before execution.

3. Run the current repository gate:

   ```sh
   pnpm check
   ```

   Source: `package.json`, `scripts.check`. It runs formatting, oxlint,
   reconstruction/source checks, package builds, workspace typechecks/tests,
   and the testing package's browser tests. It no longer runs the deleted
   DTCG, registry, release-status or design-lint graph. Do not invent those
   removed invocations.

4. For reconstructed components, themes, docs, dependencies or their integration,
   also exercise the production consumers:

   ```sh
   pnpm --filter @lenso/ui-docs build
   pnpm --filter @lenso/storybook build
   ```

   Sources: `apps/docs/package.json`, `scripts.build` (prepare, then Next
   webpack build); `packages/storybook/package.json`, `scripts.build`.
   These are not implied by the root `check` script.

5. For docs integration, start the just-built docs using
   `pnpm --filter @lenso/ui-docs start` in a managed process, wait for readiness,
   then run:

   ```sh
   pnpm --filter @lenso/ui-docs test:browser
   ```

   Sources: `apps/docs/package.json`, `scripts.start` and `scripts.test:browser`;
   `apps/docs/scripts/browser-check.mjs`. It reads `LENSO_DOCS_TEST_URL`,
   defaulting to `http://127.0.0.1:3000`. Preserve existing servers; stop only
   the process you started. Do not run an unbounded terminal server command
   that prevents executing the proof.

6. When the requested scope includes complete live-example coverage, run:

   ```sh
   pnpm --filter @lenso/ui-docs test:examples
   ```

   Sources: `apps/docs/package.json`, `scripts.test:examples`;
   `apps/docs/scripts/examples-browser-check.mjs`, which checks both locales
   and refuses missing runnable references by default. Do not substitute
   `--partial` or a family filter for a complete-scope claim. For a genuinely
   narrower task, use only the documented `--locale`, `--families`, `--base`
   options appropriate to that task, and explicitly report the reduced scope.

7. Run relevant maintained behavior/geometry/keyboard proofs for changed families.
   Inspect each proof's actual entrypoint and supported arguments before use.
   A successful Storybook build, imported snippet, mounted default, or upstream
   fixture does not prove all source workflows or pixel parity. Record
   unverified themes, RTL, reduced-motion, responsive or source-comparison
   coverage honestly. Unmet acceptance requirements are blockers, not green
   checks. Sources: `DESIGN.md`, `AGENTS.md`, family evidence documents, and
   `packages/storybook/COVERAGE.md`.
8. If Chromium, network assets or another prerequisite are missing, report the
   concrete prerequisite. Use only a verified maintained fallback appropriate
   to the exact proof; do not silently skip it, fabricate assets, suppress errors
   globally, or count an older scratch proof as current integration evidence.
9. Inspect the diff after generation/builds. Commit intended generator output,
   never hand-edit it to force freshness. Rerun affected checks after changes.
   Before the candidate is published, all required local checks must pass for
   its exact contents.

Local verification is proportional to scope. For a skill-only change, do not
claim or require full reconstruction parity merely because that larger dirty
diff also exists; isolate the skill change safely. The exact-SHA remote gate
still applies, along with the destination's current contribution requirements.

## Prepare the signed candidate

If the change is uncommitted and clearly scoped, stage explicit intended paths
and create a signed non-interactive commit. Use a repository-appropriate message;
do not overwrite unrelated staged state. Standard Git operations:

```sh
git add -- <explicit-intended-paths>
GIT_EDITOR=true git commit -m "<change message>"
```

If signing fails, stop or recover through the existing configured signer.
If already committed, use the reviewed commit containing the complete requested
change. Verify that its tree matches the reviewed and passing contents.

With a clean candidate worktree, fetch and record the base:

```sh
git fetch origin main
BASE_SHA="$(git rev-parse origin/main)"
CANDIDATE_SHA="$(git rev-parse HEAD)"
git merge-base --is-ancestor "$BASE_SHA" "$CANDIDATE_SHA"
```

If the ancestor check fails, integrate the base under the conflict policy below
and repeat review and verification. Never use force to replace `main`.

Publish the immutable candidate without force:

```sh
VERIFY_BRANCH="delta/verify/$(printf '%s' "$CANDIDATE_SHA" | cut -c1-12)"
git push origin "$CANDIDATE_SHA:refs/heads/$VERIFY_BRANCH"
```

This branch convention comes from the existing `land` workflow and base
`.github/workflows/ci.yml`. Confirm the candidate's successor supports it
before this push. Keep the branch until evidence is recorded; do not delete
remote branches or rewrite existing candidate branches.

## Verify exact-SHA remote checks

For the original `CI` workflow, the supported GitHub CLI invocation is:

```sh
gh run list --repo LioRael/lenso-ui \
  --workflow CI --branch "$VERIFY_BRANCH" --commit "$CANDIDATE_SHA" \
  --event push \
  --json databaseId,headSha,headBranch,event,status,conclusion,url
```

For an approved successor, replace `CI` only with its inspected workflow
name/path and require its actual mandatory jobs. Match branch, event, SHA,
workflow and run attempt. Wait on the selected ID:

```sh
gh run watch "$RUN_ID" --repo LioRael/lenso-ui --exit-status
gh run view "$RUN_ID" --repo LioRael/lenso-ui \
  --json headSha,headBranch,event,status,conclusion,jobs,url,attempt
```

These flags were verified against installed `gh` help. Require completed
success and every applicable mandatory job/check/review, not just a successful
workflow summary. Skipped required checks are not passing. Missing, pending,
failing, cancelled, stale or unverifiable required evidence blocks landing.
Poll with bounded waits; do not treat timeout as success. Record verified URLs.

## Concurrent changes and conflicts

Automatically resolve only clear mechanical conflicts preserving intended
behavior and source/generator ownership. Never guess at semantic, release,
licensing, policy, or acceptance conflicts.

If `origin/main` advances, preserve the old candidate and evidence, integrate
the new base in a clean attached worktree using non-interactive Git:

```sh
GIT_EDITOR=true git merge origin/main
```

Resolve only unambiguous conflicts; do not discard unrelated work or regenerate
away intentional changes. Ambiguous or destructive conflicts require a focused
question and a blocked outcome. A successfully integrated tree gets a new SHA,
fresh review, all applicable local checks and a new exact-SHA candidate run.
Never reuse the old candidate's green checks.

## Perform and verify landing

Recheck hosting requirements and fetch `main` immediately before pushing:

```sh
git fetch origin main
test "$(git rev-parse origin/main)" = "$BASE_SHA"
git merge-base --is-ancestor "$BASE_SHA" "$CANDIDATE_SHA"
```

If the base changed, follow the integration procedure instead. When the exact
candidate has passed all required checks and review, perform the established
non-force fast-forward landing:

```sh
git push origin "$CANDIDATE_SHA:refs/heads/main"
git fetch origin main
test "$(git rev-parse origin/main)" = "$CANDIDATE_SHA"
```

If destination requirements now disallow direct landing, do not push around
them; satisfy the approved destination mechanism and verify its resulting SHA.
Publishing only a topic branch or preparing a commit does not complete landing.

Observe the exact post-land main verification run using the same supported
`gh run list/watch/view` operations, with branch `main` and the landed SHA.
Report failures truthfully even if the ref advanced; never automatically revert,
force-push or publish to hide them. Inspect any release/deployment runs caused
by landing, but do not approve protected environments. Waiting for publication
approval is not publication success.

## Report the outcome

When `report_subthread_status` is available, use it for the verified final
outcome; otherwise report directly in the current conversation.

- `status: "success"` only after the intended changes are verified at the
  destination and required delivery checks pass. Title: `Landed on main`.
  Description: one short line with verified short-SHA commit and passing CI
  links. Omit unavailable links; never construct unverified run URLs.
- `status: "failure"` for a genuine blocker or failed delivery. Examples:
  `Blocked by CI`, `Push blocked`, or `Landing policy unresolved`.
  State that changes have not landed, or explicitly that `main` advanced but
  post-land delivery failed. Include actual failing check links when available.
- Do not report skill installation, a prepared commit, passing local tests or
  topic-branch publication as landing success. Status events do not replace
  necessary questions in the conversation.

Keep the title to a few sentence-case words and description to one short line.
In the conversational summary, record the base, reviewed candidate and
destination SHAs, review verdict, candidate/post-land CI results, and any
deployment/publication effects. Safe recovery may continue after a failure;
report the updated outcome only after verification.
