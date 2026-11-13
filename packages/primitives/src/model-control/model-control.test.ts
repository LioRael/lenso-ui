import { expect, test } from "bun:test";
import { checkServer, mount } from "@ui-sdk/core/testing";
import { dateField } from "./model-control.js";
import { sectionIndex } from "../section-index/section-index.js";
import { wheelPicker } from "../wheel-picker/wheel-picker.js";

globalThis.__UI_SDK_STRICT__ = true;
const items = [
  { value: "a", label: "Alpha", href: "#a" },
  { value: "b", label: "Beta", href: "#b" },
] as const;
const markup =
  '<root aria-label="Index"><item value="a" href="#a">Alpha</item><item value="b" href="#b">Beta</item></root>';
test("model commits validate and cancel at the semantic boundary", () => {
  let calls = 0;
  const view = mount(
    dateField,
    {
      defaultValue: "2026-11-13",
      validate: (value) => typeof value === "string" && value.startsWith("2026-"),
      onValueChange: (_value, details) => {
        calls++;
        details.cancel();
      },
    },
    '<root aria-label="Departure" />',
  );
  try {
    expect(view.api.setValue("invalid")).toBe(false);
    expect(calls).toBe(0);
    expect(view.api.setValue("2026-11-14")).toBe(false);
    expect(calls).toBe(1);
    expect(view.state.value).toBe("2026-11-13");
  } finally {
    view.unmount();
  }
});
test("wheel rejects disabled options and preserves reset defaults", () => {
  const view = mount(
    wheelPicker,
    {
      options: [
        { value: "a", label: "Alpha" },
        { value: "b", label: "Beta" },
        { value: "c", label: "Blocked", disabled: true },
      ],
      defaultValue: "a",
    },
    '<root aria-label="Priority" />',
  );
  try {
    expect(view.api.setValue("c")).toBe(false);
    expect(view.api.setValue("b")).toBe(true);
    expect(view.state.value).toBe("b");
    view.api.reset();
    expect(view.state.value).toBe("a");
  } finally {
    view.unmount();
  }
});
test("custom primitives render on the server and preserve direction", async () => {
  checkServer(sectionIndex, { items }, markup);
  checkServer(dateField, {}, '<root aria-label="Departure" />');
  checkServer(wheelPicker, { options: items }, '<root aria-label="Priority" />');
  for (const dir of ["ltr", "rtl"]) {
    const view = mount(sectionIndex, { items }, markup.replace("<root ", `<root dir="${dir}" `));
    try {
      view.part("item", "a")!.focus();
      await view.keys("ArrowDown");
      expect(view.state.focused).toBe("b");
      await view.keys("ArrowUp");
      expect(view.state.focused).toBe("a");
    } finally {
      view.unmount();
    }
  }
});
