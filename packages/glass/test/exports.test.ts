import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { test } from "bun:test";

test("compiled core and standalone motion work in Bun without browser globals", () => {
  const core = new URL("../dist/index.js", import.meta.url).href;
  const motion = new URL("../dist/motion/index.js", import.meta.url).href;
  const preload = fileURLToPath(new URL("../../../tests/setup/stylex.ts", import.meta.url));
  const coreScript = `
    import assert from "node:assert/strict";
    const core = await import(${JSON.stringify(core)});
    assert.equal(typeof document, "undefined");
    assert.equal(typeof core.attachGlass, "function");
    assert.equal(typeof core.prewarmGlass, "function");
  `;
  const motionScript = `
    import assert from "node:assert/strict";
    const motion = await import(${JSON.stringify(motion)});
    assert.equal(typeof document, "undefined");
    let value;
    const spring = motion.createSpring(4, 150, 19, next => value = next);
    spring.paint();
    spring.stop();
    assert.equal(value, 4);
  `;
  assert.doesNotThrow(() =>
    execFileSync(process.execPath, ["--preload", preload, "--eval", coreScript]),
  );
  assert.doesNotThrow(() => execFileSync(process.execPath, ["--eval", motionScript]));
});
