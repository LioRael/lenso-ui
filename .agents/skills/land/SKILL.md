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

An explicit landing request authorizes this workflow. Skill installation,
local checks or topic-branch publication do not authorize or complete landing.

## Preflight

1. Work in the attached Delta worktree. Inspect remotes, staged/unstaged changes,
   untracked files and committed history. Confirm the publication remote is
   `origin`, identifies `https://github.com/LioRael/lenso-ui.git`, and targets
   `main`; never publish through `local`.
2. Read `AGENTS.md`, `DESIGN.md`, `CONTRIBUTING.md`, applicable nested instructions,
   templates and current hosting requirements. Preserve `packages/primitives`
   byte-for-byte. Honor required reviews and merge mechanisms, including any
   newly configured protections or merge queue.
3. Separate the requested change from unrelated work. Stop if separation would
   discard or overwrite another participant's changes.
4. Verify the actual Node/pnpm executables against `.mise.toml` and
   `package.json`. Install with `pnpm install --frozen-lockfile` when needed.
5. Inspect `.github/workflows/verify.yml` and release/deployment effects.
   The authoritative workflow is `Verify reconstruction`, required job `verify`.
   It must support `delta/verify/**` push candidates. Missing, disabled, empty
   or candidate-ineligible verification blocks landing.

Useful preflight commands:

```sh
git remote -v
git --no-optional-locks status --short --branch
git diff
git diff --cached
gh api repos/LioRael/lenso-ui --jq '{default_branch,permissions}'
gh api repos/LioRael/lenso-ui/branches/main --jq '{name,protected}'
gh api repos/LioRael/lenso-ui/rulesets
```

Preserve configured SSH commit signing. Never use force pushes, signing bypass,
`--no-verify`, hard reset or clean to obtain a passing candidate. Never alter
protections or verification to make landing pass. Authentication checks must
not print credentials.

Landing does not authorize package publication, release tags, protected
environment approval or manual deployment. If a main push would trigger an
effect the user prohibited, report that conflict before pushing.

## Review and local verification

Review the complete intended diff, including deletions and generated artifacts.
Obtain the review required by current contribution/hosting policy for this
revision; resolve findings and repeat review after fixes. Carry licenses,
adaptation notices and consumer migration notes forward. Apply human-authored
submission requirements only using text supplied by the human.

Run affected local formatting, lint, package/script typechecks and maintained
regressions. Inspect package scripts for current entrypoints. Production
consumer builds and browser proofs are local requirements when the changed
integration needs them, not blanket work for a skill-only edit.

For component behavior, exercise relevant semantics, geometry, keyboard and
focus. For docs interaction changes, use the maintained docs browser checks
against the just-built application, setting `LENSO_DOCS_TEST_URL` when needed.
Preserve existing servers and stop only processes started for this task.
Full example-coverage claims require the maintained complete example check;
report narrower runs as scoped. Historical acceptance records, imported
snippets and default mounts are not current behavioral or visual proof.

Missing Chromium, network assets or runtime prerequisites are blockers for
the affected proof. Report them rather than suppressing errors or counting old
scratch results. Inspect generated changes, retain intended output and rerun
affected checks after fixes.

## Prepare and publish the signed candidate

Stage explicit intended paths without overwriting unrelated staged work.

```sh
git add -- <explicit-intended-paths>
GIT_EDITOR=true git commit -m "<change message>"
git fetch origin main
BASE_SHA="$(git rev-parse origin/main)"
CANDIDATE_SHA="$(git rev-parse HEAD)"
git merge-base --is-ancestor "$BASE_SHA" "$CANDIDATE_SHA"
```

Signing failure blocks publication; recover only through the configured signer.
An existing reviewed signed commit may be used if its tree matches the passing
contents. Publish the immutable candidate without force:

```sh
VERIFY_BRANCH="delta/verify/$(printf '%s' "$CANDIDATE_SHA" | cut -c1-12)"
git push origin "$CANDIDATE_SHA:refs/heads/$VERIFY_BRANCH"
```

## Exact-SHA candidate CI gate

Select a push run matching workflow, repository, candidate branch and exact SHA:

```sh
gh run list --repo LioRael/lenso-ui \
  --workflow "Verify reconstruction" --branch "$VERIFY_BRANCH" \
  --commit "$CANDIDATE_SHA" --event push \
  --json databaseId,headSha,headBranch,event,status,conclusion,url
gh run watch "$RUN_ID" --repo LioRael/lenso-ui --exit-status
gh run view "$RUN_ID" --repo LioRael/lenso-ui \
  --json headSha,headBranch,event,status,conclusion,jobs,url,attempt
```

Require completed success for `verify` and every other applicable mandatory
check/review, not merely a workflow summary. Skipped required checks are not
passing. Missing, pending, failing, cancelled, stale or unverifiable evidence
blocks landing. Wait with a bounded timeout; timeout is not success.

Candidate CI is the authoritative complete verification of the exact SHA.
There is no independent signed-proof framework or historical acceptance gate.

## Integrate concurrent changes

Fetch main again before landing. If it advanced, preserve the old candidate
and evidence, integrate the new base in a clean attached worktree with
`GIT_EDITOR=true git merge origin/main`, and repeat review, affected local
checks and exact-SHA candidate CI. A changed tree needs a new SHA and new run.

Resolve only clear mechanical conflicts that preserve behavior and ownership.
Semantic, release, licensing or policy conflicts require a focused question.
Never discard unrelated work or reuse the previous candidate's green checks.

## Land and verify delivery

Recheck hosting requirements and the base immediately before the non-force
fast-forward:

```sh
git fetch origin main
test "$(git rev-parse origin/main)" = "$BASE_SHA"
git merge-base --is-ancestor "$BASE_SHA" "$CANDIDATE_SHA"
git push origin "$CANDIDATE_SHA:refs/heads/main"
git fetch origin main
test "$(git rev-parse origin/main)" = "$CANDIDATE_SHA"
```

If the base changed, integrate and reverify instead. If protections disallow
direct landing, use the approved mechanism and verify its resulting SHA.

Observe the exact landed SHA's main verification run. Main may reuse only
successful trusted internal `delta/verify/**` push evidence from the same
repository, workflow and exact SHA, with matching workflow inputs and a verified
unexpired docs artifact bound to that run attempt. PR/fork results are excluded.
Lookup, download or provenance uncertainty requires full normal verification.
Inspect the maintained workflow for the precise artifact and digest checks;
do not implement a second trust decision in this skill.

Require main verification and required delivery checks to succeed. Record the
actual run URLs and inspect deployment/publication effects without approving
protected environments. Main advancing with failed delivery is not success.
Never force-push, automatically revert or publish to hide a failure.

## Report

Report base, reviewed candidate and destination SHAs, review verdict, candidate
and main CI results, and actual deployment/publication effects. Use verified
links only. State `Landed on main` only after destination and required delivery
checks pass. Otherwise name the blocker and say whether main advanced.
Local success, a prepared commit or a topic branch is not landing success.
