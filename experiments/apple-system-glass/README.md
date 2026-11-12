# Apple system glass probe

This isolated experiment compares ordinary CSS backdrop blur, Apple's private
system material by itself, and a feature-detected enhancement with a CSS fallback.
It does not change the shared Lenso renderer or preserved primitive components.

## Observed result — 2026-11-12

Opened `probe.html` directly in the installed Safari using native UI automation.
Host: macOS 27.2, build 26B123. Safari's page user agent reports Version/27.2.

| Observation                                                            | Result               |
| ---------------------------------------------------------------------- | -------------------- |
| `CSS.supports("-apple-visual-effect", "-apple-system-glass-material")` | `false`              |
| `CSS.supports("-apple-visual-effect", "-apple-system-blur-material")`  | `false`              |
| System-only panel's computed `-apple-visual-effect`                    | Empty string         |
| System-only panel's computed backdrop filter / background              | `none` / transparent |
| Baseline panel's computed backdrop filter                              | `blur(12px)`         |

This establishes that the property is unavailable in this ordinary Safari page.
The enhancement's `@supports` block consequently does not apply in this session.
It does not establish availability in a specially configured WKWebView, future
Safari versions, or other Apple devices. There is no native material performance
measurement: the system effect did not activate.

The native WKWebView probe compiled successfully with the installed Swift compiler.
Its default-mode run could not finish: the execution sandbox denied WebKit service
and data-directory access, and the run timed out. The private-enabled mode was not
run. No private-enabled rendering result is claimed. Playwright was also unavailable:
the installed package expected a missing WebKit build, and the existing older build
aborted when launched. The Safari result above is from the actual installed browser.

## Reproduce

Open `probe.html` in Safari. The report beneath the three panels shows feature
detection and computed values. The middle panel deliberately has no fallback:
its unmodified striped background makes an absent effect apparent. The last panel
retains backdrop blur unless the browser accepts the system material.

For a separate native-host comparison, compile the optional Swift harness:

```sh
xcrun swiftc -module-cache-path /tmp/lenso-glass-module-cache experiments/apple-system-glass/probe.swift -o /tmp/lenso-system-glass-probe
/tmp/lenso-system-glass-probe "$PWD/experiments/apple-system-glass/probe.html" default /tmp/lenso-system-glass-default.png
/tmp/lenso-system-glass-probe "$PWD/experiments/apple-system-glass/probe.html" private-enabled /tmp/lenso-system-glass-private.png
```

The private preference applies only to this temporary harness's WKWebView. It does
not change Safari settings. It is research code, not a supported shipping API.
Snapshots are diagnostic and may not capture all hosted system compositor effects;
inspect the actual native window as well if the preference can be enabled.

## Decision

Keep the existing Lenso renderer for public websites. A native enhancement remains
possible in a host that actually enables the material, but adding an unsupported
CSS declaration alone cannot replace the renderer or remove its runtime work.
Before integrating that path, verify visible material rendering and stop the
replaced copy/filter work; then measure interaction and scrolling costs.

## Native app follow-up — confirmed working

The subsequent `App.swift` experiment successfully launched as a real AppKit
application bundle on the same macOS 27.2 host. Its two independent WKWebViews
load the same bundled HTML with nonpersistent data stores. Only the right-hand
view enables `useSystemAppearance` before creation. Native UI automation read
the reports and captured the actual application window.

| Observation                         | Default WKWebView | Private preference enabled                       |
| ----------------------------------- | ----------------- | ------------------------------------------------ |
| Private setter exists               | Yes               | Yes                                              |
| CSS glass support                   | `false`           | `true`                                           |
| CSS system blur support             | `false`           | `true`                                           |
| System-only panel's computed effect | Empty string      | `-apple-system-glass-material`                   |
| System-only panel's backdrop filter | `none`            | `none`                                           |
| Visible system material             | Absent            | Present, with refracted stripes and shaped edges |

This replaces the earlier native-host blocker as the latest experiment result:
the bundled GUI app works. No browser-wide setting was changed. The existing
Safari result is unchanged. Performance under scrolling, animation and many
simultaneous surfaces has not been measured.

Build and launch the side-by-side app from the repository root:

```sh
experiments/apple-system-glass/script/build_and_run.sh
```

Use `--build-only` to compile without launching, or `--verify` for an additional
process-presence check. Build output is the ignored experiment-local
`dist/LensoGlassProbe.app`. The experiment also has its own Codex Run action;
the main web project's run configuration is unchanged. Quit using Command-Q.
