import { describe, expect, it } from "vitest";

import { normalizePromptComposerMaxRows } from "../../../../../../registry/source/recipes/prompt-composer/autosize";
import {
  shouldSubmitPrompt,
  type PromptComposerKeyGesture,
  type PromptComposerSubmitShortcut,
} from "../../../../../../registry/source/recipes/prompt-composer/keyboard";

function gesture(overrides: Partial<PromptComposerKeyGesture> = {}): PromptComposerKeyGesture {
  return {
    altKey: false,
    ctrlKey: false,
    isComposing: false,
    key: "Enter",
    metaKey: false,
    shiftKey: false,
    ...overrides,
  };
}

function shouldSubmit(
  shortcut: PromptComposerSubmitShortcut,
  overrides: Partial<PromptComposerKeyGesture> = {},
): boolean {
  return shouldSubmitPrompt(gesture(overrides), shortcut);
}

describe("PromptComposer submit shortcuts", () => {
  it("keeps plain Enter and Shift+Enter as newlines by default", () => {
    expect(shouldSubmit("mod-enter")).toBe(false);
    expect(shouldSubmit("mod-enter", { shiftKey: true })).toBe(false);
  });

  it("submits Mod+Enter on macOS and other platforms", () => {
    expect(shouldSubmit("mod-enter", { metaKey: true })).toBe(true);
    expect(shouldSubmit("mod-enter", { ctrlKey: true })).toBe(true);
    expect(shouldSubmit("mod-enter", { altKey: true, metaKey: true })).toBe(false);
  });

  it("lets an existing Enter-to-send consumer opt in explicitly", () => {
    expect(shouldSubmit("enter")).toBe(true);
    expect(shouldSubmit("enter", { ctrlKey: true })).toBe(false);
    expect(shouldSubmit("enter", { metaKey: true })).toBe(false);
    expect(shouldSubmit("enter", { shiftKey: true })).toBe(false);
  });

  it("never submits during IME composition or when disabled by policy", () => {
    expect(shouldSubmit("enter", { isComposing: true })).toBe(false);
    expect(shouldSubmit("mod-enter", { isComposing: true, metaKey: true })).toBe(false);
    expect(shouldSubmit("none")).toBe(false);
  });
});

describe("PromptComposer autosize limits", () => {
  it("normalizes the Consumer row limit without allowing a zero-height input", () => {
    expect(normalizePromptComposerMaxRows(5.8)).toBe(5);
    expect(normalizePromptComposerMaxRows(0)).toBe(1);
    expect(normalizePromptComposerMaxRows(Number.POSITIVE_INFINITY)).toBe(8);
  });
});
