import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = path.resolve(import.meta.dirname, "../..");
const core = await import(
  pathToFileURL(
    path.resolve(
      process.argv[2] ?? path.join(root, ".cache/local-activation/dist/.gen/reactive-core.js"),
    ),
  ).href
);
const { sig, act, W, commit, effect, scope, end, installCommit } = core;
const cell = sig(0, "n");
let seen;
const bindings = scope(() =>
  effect(() => {
    seen = cell();
  }),
);
const increment = act(() => W(cell, cell() + 1));
assert.equal(increment(), true);
assert.equal(seen, 1);
assert.equal(
  commit(() => W(cell, "invalid")),
  false,
);
assert.equal(cell(), 1);
assert.equal(seen, 1);
assert.equal(
  commit(() => {
    W(cell, 2);
    throw Error("abort");
  }),
  false,
);
assert.equal(cell(), 1);
assert.equal(
  commit(() => {
    W(cell, 2);
    W(cell, "invalid");
  }),
  false,
);
assert.equal(cell(), 1);
assert.equal(seen, 1);
let calls = 0;
installCommit({
  commit: (fn) => {
    calls++;
    fn();
    return true;
  },
  W: (signal, value) => core.write(signal.n, value),
});
assert.equal(increment(), true);
assert.equal(calls, 1);
assert.equal(cell(), 2);
end(bindings);
const stopped = seen;
core.write(cell.n, 3);
core.flush();
assert.equal(seen, stopped);
console.log(
  "Early typed writes, refusal rollback, native commit delegation and scope cleanup passed",
);
