import { test, expect } from "bun:test";
import { selectCollection, selectionMode } from "../src/collection-selection";
// Compound range contraction must remove only the previous range, preserving independent selections.
test("range contraction preserves independent selections and skips disabled keys supplied by the controller", () => {
  const keys = ["", "雪", "delta", "echo"];
  const grown = selectCollection(keys, ["echo", ""], "delta", "multiple", "", [""]);
  expect(grown.value).toEqual(["echo", "", "雪", "delta"]);
  expect(selectCollection(keys, grown.value, "雪", "multiple", "", grown.range).value).toEqual([
    "echo",
    "",
    "雪",
  ]);
});
test("single and none modes retain controlled ownership and arbitrary string keys", () => {
  expect(selectCollection(["", "a,b"], [""], "a,b", "single").value).toEqual(["a,b"]);
  expect(selectCollection(["", "a,b"], [""], "a,b", "none").value).toEqual([""]);
  expect(selectCollection(["", "a,b"], [""], "", "multiple").value).toEqual([]);
  expect(selectCollection([""], [""], "missing", "multiple").value).toEqual([""]);
  expect(() => selectionMode("invalid")).toThrow(RangeError);
});
