> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# Native Apple targets

The framework builds native AppKit and UIKit applications through Exact's Apple host. It does not embed the static website in a WebView. This is experimental native support for the same headless content/layout contracts; no Lenso UI theme is added.

## Build and run

Use macOS, Xcode, Bun 1.4.4 and an initialized Exact Apple checkout. With EXACT_ROOT set, from this package:

```sh
bun run build:macos
bun run build:ios
bun src/cli.ts build example --platform ios --run --sim "<existing simulator UDID>"
```

In a project created by `new`, use `bun run macos` / `bun run ios`, or `bun docs.ts build --platform macos|ios`. Web remains the default build target; `dev` is the Web watcher. Rebuild native targets after editing content. The CLI prints the resulting .app path. iOS without `--run` compiles and signs for Simulator without installing it or booting a device. These commands build local development applications, not distribution archives or App Store submissions.

The generated applications are separate: .exact-docs/app for Web, app-macos and app-ios for Apple. Native compilation normally uses .exact-docs/native-target, outside those replaceable generated app directories, so regenerating content keeps SDK compilation caches. An invocation's CARGO_TARGET_DIR overrides this. Exact's generated Rust workspace is prepared before the Apple build starts: its receipt can then distinguish authored edits from generated files. No receipt or staleness check is bypassed.

`app.json` preserves the author's `app` and `host` settings, including host.macos.window and Apple minimumOS values. App identity is shared across the platform builds unless the author changes it. `buildNative(directory, {platform, exactRoot?, run?, sim?})` also exposes the generated app, bundle and target paths to tooling.

## Runtime boundaries

Markdown values, original source, metadata and scope search indexes are bundled as static data modules for native targets. Native executables need no documentation HTTP server to read or search. Web retains lazy imports and current-page checkpoints; the Apple data policy does not add native data to the Web entry.

Apple routing pushes new destinations onto the selected stack and returns to matching visits on that stack. The view retains each visit with its own page identity, content and scrolling screen, so covered pages remain available to native navigation. A stack resource reads only the visits in the selected stack from the bundled data. Root resource/mutation/task state stays mounted. The native Back control has the `docs-back` id and the `back` part; `labels.back` supplies its localized title.

Custom Exact pages, registered Markdown components, root data modules and optional kept hooks use the same APIs. Layouts/pages can inject docsPlatform (`web`, `macos`, `ios`) and existing content/status/scope bindings. A scrolling native screen and a semantic Back action are structural host integration, without colors, fonts, spacing recipes or a default theme. Custom modules still need dependencies and grants that Exact supports on that host.

Native Markdown copying uses Exact's copyText command. docsMarkdownUrl and docsSearchIndexUrl are empty on native targets because the static raw-source/search endpoints belong to the website. Layouts should use the supplied search action/results and Markdown value. Sitemap, canonical/alternate HTML links and the browser metadata/focus bridge are Web features; native titles and reading direction come from the Contract tree.

## Verification

Verified locally with the pinned Exact Rust 1.97.0 toolchain and Xcode 27.2:

| Target                                         | Build                           | Interaction             |
| ---------------------------------------------- | ------------------------------- | ----------------------- |
| macOS, Apple Silicon                           | Native .app compiled and signed | Native host test passed |
| iOS Simulator, arm64, iPhone 18 Pro / iOS 27.2 | Native .app compiled and signed | UIKit test passed       |
| Physical iPhone/iPad, Intel Mac, distribution  | Not verified                    | Not verified            |

The same authored test runs on both native hosts. It checks root reads, a saved mutation and refreshed value, four timer ticks, timer pause, an embedded Contract counter, platform Back, cached page return, actual offline search results, Chinese content, archived-version selection root state after scope changes, and returning from a missing-page screen. It is not a native layout/accessibility audit or proof of swipe gestures, clipboard contents, deep-link registration or real-device performance.

```sh
# From experiments/exact-docs, with the initialized SDK and native toolchain:
bun run test:native
NATIVE_PLATFORM=ios EXACT_SIM="<existing simulator UDID>" bun run test:native
```

`test/native.test.contract` is the shared behavioral specification. `test/native.mjs` builds the matching target before driving it through Exact's native agent. iOS tests can boot the specified existing simulator; use an idle simulator to avoid disturbing another drive. No simulator is erased or created. Unit coverage separately checks platform manifests, offline imports, metadata/search values, data-module forwarding and isolation from Web generation. Existing production browser checks pass in Chromium and WebKit.

Native data is packaged together, and pushed visits keep their UI/data state. The 100–300-page Web startup reports do not establish native memory or launch budgets. The native interaction fixture currently uses the example's nine authored URLs, two languages and two versions. Larger native corpora and platform gestures remain additional acceptance work.
