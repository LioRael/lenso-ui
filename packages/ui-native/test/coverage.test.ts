import { expect, test } from "bun:test";

// Catch a silently shrinking native migration inventory when Web adds another family.
test("native migration tracks every current Web component family without claiming alias parity", async () => {
  const web = await Bun.file(new URL("../../ui/src/components/index.ts", import.meta.url)).text();
  const expected = [...web.matchAll(/"\.\/([^/]+)\/index\.js"/g)].map((match) => match[1]);
  const inventory = await Bun.file(
    new URL("../../../docs/design/native-component-coverage.json", import.meta.url),
  ).json();
  const actual = inventory.families.map((item: { family: string }) => item.family);
  expect(new Set(actual).size).toBe(actual.length);
  expect(actual.toSorted()).toEqual(expected.toSorted());
  for (const item of inventory.families) {
    expect(["missing", "partial", "complete"]).toContain(item.status);
    if (item.status === "complete") {
      expect(item.verification.ios).toBe("accepted");
      expect(item.verification.android).toBe("accepted");
      expect(item.remaining).toBe("");
    }
  }
});
