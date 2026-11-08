import { expect, test } from "bun:test";
import { groupParameters } from "../stories/parameter-groups";

test("parameter groups preserve field records and leave unfamiliar controls accessible in More", () => {
  const fields = ["disabled", "variant", "label", "customBehavior", "size"].map((name) => ({
    name,
  }));
  const groups = groupParameters(fields);
  expect(groups.content.map((field) => field.name)).toEqual(["label"]);
  expect(groups.appearance.map((field) => field.name)).toEqual(["variant", "size"]);
  expect(groups.state.map((field) => field.name)).toEqual(["disabled"]);
  expect(groups.more.map((field) => field.name)).toEqual(["customBehavior"]);
  expect(Object.values(groups).flat()).toHaveLength(fields.length);
  expect(groups.state[0]).toBe(fields[0]);
});
