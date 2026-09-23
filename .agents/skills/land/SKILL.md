---
name: land
description: >-
  Land an explicitly requested Lenso UI change through the repository's
  candidate-SHA workflow. Invoke only when the user has requested landing or
  merging changes; do not invoke for review, preparation, checks, or skill
  installation alone.
metadata:
  delta-action: land
---

# Land Lenso UI changes

Use this skill only after an explicit request to land the current change. The
request itself authorizes the merge; do not ask again whether the user wants
the change landed. This repository does not use a PR as the normal request
surface, so land through the `origin` remote and the direct `main` fast-forward
workflow.

## Invariants

- Work only in the current Delta project worktree. Preserve unrelated dirty,
  unmerged, and untracked work; never run `git reset --hard`, `git clean`, or a
  force push.
- The source remote is the repository's `origin` remote, and the destination
  is `main`. Verify both instead of assuming them.
- A candidate SHA must pass the candidate `CI` workflow before it can reach
  `main`. A started, pending, partial, or differently sourced run is not a
  passing gate.
- Keep the existing CI and release workflows unchanged. Do not run npm
  publish, Changesets publish/version, tag creation, or a docs deployment
  manually. The release workflow remains the protected publication path:
  `.github/workflows/release.yml`.
- Preserve configured commit signing. Do not bypass signing hooks or use
  `--no-verify` to make a commit or push succeed.

## Preflight

1. Confirm that the current directory is the Lenso UI repository and read the
   applicable `AGENTS.md`, `CONTRIBUTING.md`, `CONTEXT.md`, and relevant
   `docs/adr/` files before repository operations.
2. Verify the toolchain against `.mise.toml`, the root `package.json`, and CI:
   Node `24.18.0` and pnpm `11.5.0`. If the active toolchain does not match
   and the repository's configured environment cannot be used, stop rather
   than presenting a local result as equivalent to CI.
3. Verify the remotes and destination:

   ```bash
   git remote -v
   git fetch --prune origin main
   git rev-parse origin/main
   ```

   `origin` is the GitHub source remote used by the candidate workflow.
   `main` currently has no branch protection or ruleset, so the fast-forward
   and exact-SHA checks below are process safeguards, not a server-enforced
   merge queue.

4. Inspect `git status --short --branch`, staged changes, and the full diff.
   If unrelated work or unresolved conflicts are present, do not stage it.
   If the requested change is clearly separable, stage only its explicit
   paths. If it is not separable, stop and report the files that would be
   endangered.
5. If the requested change is uncommitted and its scope is clear, create a
   signed, non-interactive commit with a repository-appropriate message:

   ```bash
   GIT_EDITOR=true git add <explicit-intended-paths>
   GIT_EDITOR=true git commit -m "<change message>"
   ```

   Do not commit unrelated files. If the change is already committed, use
   that commit or the reviewed descendant containing the complete change.

6. For public package, component, token, registry, or visual-contract changes,
   verify that a Changeset exists and names the affected public package. The
   repository requires Changesets for public changes
   (`CONTRIBUTING.md`, “Changesets and public changes”); do not invent a
   release version or manually edit generated release state.

## Review and local verification

1. Run the final Delta Review against the exact current change. Absorb required
   fixes, then repeat the review after any change. Do not create a candidate
   from a pre-review SHA.
2. Install from the committed lockfile when dependencies are needed:

   ```bash
   pnpm install --frozen-lockfile
   ```

   This is the same installation mode used by `.github/workflows/ci.yml`.

3. Run the repository gate:

   ```bash
   pnpm check
   ```

   The root `check` script is the release-oriented gate. It includes formatting,
   Oxlint, action pin checks, release-status checks, generation, generated-token
   freshness, Turbo typechecks/tests/builds, and the separate design-lint
   command (`package.json`, `scripts.check` and `scripts.design-lint`).

4. Require a clean diff after verification except for intentional committed
   state. Generated output must be produced by the repository generators, not
   hand-edited. Record the exact reviewed commit SHA.

## Candidate-SHA gate

1. Recheck the base immediately before creating the candidate:

   ```bash
   git fetch --prune origin main
   BASE_SHA="$(git rev-parse origin/main)"
   CANDIDATE_SHA="$(git rev-parse HEAD)"
   git merge-base --is-ancestor "$BASE_SHA" "$CANDIDATE_SHA"
   ```

2. Confirm the candidate commit contains the candidate branch trigger in
   `.github/workflows/ci.yml` (`delta/verify/**`) and the main-only artifact
   and deployment guards. A candidate made from a workflow that cannot run on
   its verification branch is not landable.
3. Push the immutable candidate SHA without force:

   ```bash
   VERIFY_BRANCH="delta/verify/${CANDIDATE_SHA:0:12}"
   git push origin "$CANDIDATE_SHA:refs/heads/$VERIFY_BRANCH"
   ```

4. Locate exactly the `CI` push run whose branch and `headSha` both match the
   candidate:

   ```bash
   gh run list --repo LioRael/lenso-ui \
     --workflow CI \
     --branch "$VERIFY_BRANCH" \
     --commit "$CANDIDATE_SHA" \
     --event push \
     --json databaseId,headSha,headBranch,status,conclusion,url
   ```

   Wait with `gh run watch <run-id> --repo LioRael/lenso-ui --exit-status`,
   then read `gh run view <run-id> --repo LioRael/lenso-ui --json ...`.
   Require `event=push`, the exact candidate SHA, the expected branch, a
   successful `verify` job, and a successful overall conclusion. Candidate
   docs artifact preservation and `deploy-docs` must be skipped by the current
   main-only guards.

5. Keep the verification branch until the landing evidence is recorded. Do
   not treat a green run for another SHA, branch, event, or attempt as proof.
   If the candidate run is missing, pending beyond a reasonable wait, failed,
   canceled, or unverifiable, report failure and do not push `main`.

## Integrate concurrent `main` changes

The conflict policy for this skill is **automatic resolution of only clearly
mechanical conflicts**. If `origin/main` advances before the landing push:

1. Stop the current candidate. Fetch the new `origin/main` and preserve the
   old candidate branch and evidence.
2. With a clean worktree, integrate the new base non-interactively. Resolve
   only unambiguous, mechanical conflicts that preserve the intended change
   and generated-source ownership. Never guess at semantic, release, token,
   registry, or documentation conflicts.
3. If any conflict is ambiguous, destructive, or requires user intent, stop
   and report the conflicting paths; do not continue or force-push.
4. For a successful integration, create a new commit SHA, repeat Delta Review,
   run `pnpm check`, and execute a new exact-SHA candidate gate. Never land the
   old SHA after `main` has advanced.

## Fast-forward landing and side effects

1. Immediately before landing, fetch again and require that `origin/main`
   still equals the `BASE_SHA` used for the passing candidate. If it differs,
   follow the concurrent-change procedure instead.
2. Push the already-gated SHA directly and without force:

   ```bash
   git push origin "$CANDIDATE_SHA:refs/heads/main"
   ```

3. Verify the destination:

   ```bash
   git fetch --prune origin main
   test "$(git rev-parse origin/main)" = "$CANDIDATE_SHA"
   ```

4. A successful `main` push can start the existing docs deployment and the
   `workflow_run` release workflow. Never approve the protected `npm`
   environment or invoke publication yourself. If the user explicitly said
   not to deploy or publish, stop before step 2 after the candidate gate and
   report that the candidate is verified but not landed because the current
   main workflow has those side effects.
5. Otherwise, observe and record the post-land `CI` run for the exact SHA and
   any `Release` run. A post-land failure must be reported as a failed
   delivery even though the ref may already have advanced. A release waiting
   for its protected environment is not publication success; do not approve it
   without a separate explicit publication request.

## Reporting

When this runs in a subthread, call `report_subthread_status` after the outcome
is verified. Use `status: "success"` only when the exact requested SHA is
confirmed on `origin/main`; use `status: "failure"` when checks fail, a
workflow is missing or unverifiable, a conflict is ambiguous, or the push does
not reach the destination. Include:

- base SHA, reviewed/candidate SHA, verification branch, and destination SHA;
- the Delta Review verdict;
- the exact candidate `CI` run URL and result, plus post-land run URLs when
  applicable;
- whether docs deployment, npm publication, tags, or releases occurred;
- the short commit link and relevant run links.

A prepared commit, pushed verification branch, or passing local check is not a
successful landing. If the destination was not verified, report that the
change did not land.
