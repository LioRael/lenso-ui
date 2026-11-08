# Glass driver comparison

Compares the package's default TypeScript/WebGL2 driver with its retained
Rust/Wasm/WebGL2 driver using identical shaders and inputs. This is an internal
rendering fixture, not a component or arbitrary-DOM capture benchmark.

```sh
bun experiments/glass-driver-comparison/build-wasm.ts
bun test experiments/glass-driver-comparison/wasm.test.ts
bun experiments/glass-driver-comparison/server.ts
```

The first command is only needed after changing Rust or GLSL. Checked-in generated
files suffice to run the comparison. `generate:shaders` regenerates only TS
strings without Rust; rebuilding the Wasm comparison still requires Rust.

Open the printed loopback URL and click **Compare drivers**. The default port
is 4324. `GLASS_DRIVER_PORT` overrides it; `GLASS_DRIVER_EVIDENCE` sets the local
report directory (default `/tmp/lenso-glass-driver-evidence`). `?first=wasm`
reverses initial module loading; timed rounds alternate execution order.

Eight pixel comparisons cover light/dark, Small/Medium and 1/16 panels. Timing
covers 1/16/100 panels, three rounds per driver, a fixed 1200 × 800 source, serial
calls followed by `gl.finish`, and real frame pacing. Pixel readbacks are outside
timed samples. Treat call timing and frame pacing separately; neither is an
isolated GPU timer query. A hidden document invalidates a timing run.

Both drivers derive from the Lenso route lab under its retained MIT notices and
consume the package-owned GLSL sources. See `packages/glass/shaders/NOTICE.md`.
No shader or runtime from MyGo is included.

Results and limitations: `docs/research/glass-driver-comparison-validation.md`.
