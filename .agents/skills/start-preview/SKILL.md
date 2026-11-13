---
name: start-preview
description: Start or reuse the docs dev server and browser tab for component, theme, animation and documentation work; verify readiness and return its URL.
---

This skill starts or reuses the hot-reloading documentation dev server. Its
existing name and `.agents/preview` launcher are runner integration names, not a
request to build or serve static output. Follow the development-server policy in
[CONTRIBUTING.md](../../../CONTRIBUTING.md); package builds and separate package
watchers are unnecessary for visual iteration.

1. Inspect listeners and their process working directories before starting
   anything. Reuse a healthy docs dev server belonging to this checkout and its
   existing browser tab. Parallel tasks use that same entry. Verify its readiness
   with `.agents/preview-check`, setting `PREVIEW_PORT` to its actual port.
2. If this checkout has no running docs dev server, run `.agents/dependencies`
   and source `. .agents/env` from the repository root. Use the default port 4310;
   choose another explicit port only if it belongs to an unrelated process or an
   isolated check requires it. Never use runner-reserved 49983. Diagnose an
   unhealthy shared server before replacing it; preserve unrelated processes.
3. For a new server, run `PREVIEW_PORT=4310 .agents/preview` in an owned terminal,
   substituting an explicitly selected port when necessary. It stays in the
   foreground. If it needs to persist on Delta, ask the user to background that
   terminal with the terminal UI; these commands have no invented `--background` flag.
4. For a new server, retry `PREVIEW_PORT=4310 .agents/preview-check` for up to
   120 seconds while checking that the owned terminal remains alive. A failed
   build, terminated process or timeout is a failure, even if an unrelated listener
   answers. Report errors without environment values. A response proves readiness,
   not authentication or full application acceptance.
5. On a supported runner, return exactly the HTTPS URL printed by
   `delta-runner preview url 4310`. Locally return the loopback URL. Never infer
   a preview hostname or expose a port whose host/origin checks reject it.
6. Reuse the docs browser tab for the user's requested component and return one
   URL. Close temporary fixture/static-preview tabs and stop their owned servers
   when checks finish. Keep the shared dev server and requested tab available to
   the user. Stop it through Ctrl+C only when its consumers no longer need it or
   the user requests cleanup, and wait for cleanup.

Delta preview access is per runner; share it only with trusted collaborators.
