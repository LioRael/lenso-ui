---
name: start-preview
description: Start the existing ui development preview, verify readiness, and return its supported URL.
---

This is the real documentation dev server. It reads workspace source and theme CSS directly; package builds and separate package watchers are unnecessary for preview edits. Static builds may run concurrently.

1. From the repository root, run `.agents/dependencies` and source `. .agents/env`.
2. Choose a free `PREVIEW_PORT` (default 4310); never use runner-reserved 49983.
   Check listeners first. Do not reuse or kill an unrelated process.
3. Run `PREVIEW_PORT=4310 .agents/preview` in an owned terminal. It stays in the
   foreground. If it needs to persist on Delta, ask the user to background that
   terminal with the terminal UI; these commands have no invented `--background` flag.
4. In another terminal, retry `PREVIEW_PORT=4310 .agents/preview-check` for up to
   120 seconds while checking that the owned terminal remains alive. A failed
   build, terminated process or timeout is a failure, even if an unrelated listener
   answers. Report errors without environment values. A response proves readiness,
   not authentication or full application acceptance.
5. On a supported runner, return exactly the HTTPS URL printed by
   `delta-runner preview url 4310`. Locally return the loopback URL. Never infer
   a preview hostname or expose a port whose host/origin checks reject it.
6. Stop the owned server through Ctrl+C and wait for cleanup. Never stop an
   unrelated process.

Delta preview access is per runner; share it only with trusted collaborators.
