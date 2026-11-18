import { expect, test } from "bun:test";
import { createPhotosSession } from "./photos-model";

test("viewer overlays cross screens but cannot act on a subsequently selected photo", () => {
  const session = createPhotosSession();
  try {
    const inner = session.screen("inner");
    const cover = session.screen("cover");
    inner.set("selected", 2);
    inner.set("viewerMenu", "album");
    session.setPose(90, true);
    cover.set("viewerMenu", null);
    session.setPose(0, false);
    expect(cover.getSnapshot().state.viewerMenu).toBe("album");
    cover.set("viewerMenu", null);
    cover.set("viewerConfirmation", { kind: "hide", id: 2, open: true });
    session.setPose(180, false);
    expect(inner.getSnapshot().state.viewerConfirmation).toEqual({
      kind: "hide",
      id: 2,
      open: true,
    });
    inner.set("selected", 8);
    expect(inner.getSnapshot().state.viewerConfirmation).toBeNull();
    inner.set("viewerMenu", "information");
    inner.set("selected", null);
    expect(inner.getSnapshot().state.viewerMenu).toBeNull();
  } finally {
    session.dispose();
  }
});

test("an unfinished editor adjustment crosses the hinge as one undoable draft, not a saved edit", () => {
  const session = createPhotosSession();
  try {
    const inner = session.screen("inner");
    const cover = session.screen("cover");
    const right = session.screen("inner-right");
    inner.openEditor(2);
    inner.changeEditor((editor) => ({
      ...editor,
      draft: { ...editor.draft, exposure: 37 },
      comparing: true,
    }));
    session.setPose(90, true);
    right.changeEditor((editor) => ({ ...editor, draft: { ...editor.draft, exposure: -20 } }));
    inner.closeEditor();
    session.setPose(0, false);
    const editor = cover.getSnapshot().state.editor!;
    expect(editor.draft.exposure).toBe(37);
    expect(editor.history.past.map((entry) => entry.exposure)).toEqual([0]);
    expect(editor.history.present.exposure).toBe(37);
    expect(editor.comparing).toBe(false);
    expect(cover.getSnapshot().state.edits.size).toBe(0);
    cover.closeEditor();
    session.setPose(180, false);
    expect(inner.getSnapshot().state.editor).toBeNull();
    expect(inner.getSnapshot().state.edits.size).toBe(0);
  } finally {
    session.dispose();
  }
});

test("folded projections freeze together, reject stale readiness and defer authoritative updates", () => {
  const session = createPhotosSession();
  try {
    const inner = session.screen("inner");
    const right = session.screen("inner-right");
    const cover = session.screen("cover");
    const owner = session.screen("standalone");
    inner.set("query", "City");
    const beforeFold = inner.getSnapshot();
    session.setPose(110, true);
    right.set("query", "incorrect");
    cover.set("query", "incorrect");
    inner.set("query", "incorrect");
    expect(inner.getSnapshot().state.query).toBe("City");
    expect(right.getSnapshot().state).toBe(inner.getSnapshot().state);
    inner.ready(beforeFold);
    right.ready(right.getSnapshot());
    expect(session.isReady("inner")).toBe(false);
    inner.ready(inner.getSnapshot());
    expect(session.isReady("inner")).toBe(true);
    expect(session.isReady("inner-right")).toBe(true);
    owner.set("query", "Forest");
    expect(inner.getSnapshot().state.query).toBe("City");
    expect(right.getSnapshot().state.query).toBe("City");
    session.setPose(0, false);
    expect(cover.getSnapshot().state.query).toBe("Forest");
    expect(cover.getSnapshot().interactive).toBe(true);
    expect(inner.getSnapshot().interactive).toBe(false);
  } finally {
    session.dispose();
  }
});

test("only the active surface can duplicate a photo, with one shared ID sequence", async () => {
  const session = createPhotosSession();
  try {
    const inner = session.screen("inner");
    const right = session.screen("inner-right");
    const cover = session.screen("cover");
    await inner.duplicatePhoto(2);
    await right.duplicatePhoto(2);
    expect(inner.getSnapshot().state.sources).toHaveLength(25);
    expect(inner.getSnapshot().state.favorites.has(24)).toBe(true);
    session.setPose(0, false);
    await cover.duplicatePhoto(24);
    expect(cover.getSnapshot().state.sources).toHaveLength(26);
    expect(cover.getSnapshot().state.sources.at(-1)?.id).toBe(25);
    expect(cover.getSnapshot().state.favorites.has(25)).toBe(true);
  } finally {
    session.dispose();
  }
});

test("a reactivated screen waits for its new paint without blocking ordinary edits", () => {
  const session = createPhotosSession();
  try {
    const inner = session.screen("inner");
    const cover = session.screen("cover");
    inner.ready(inner.getSnapshot());
    cover.ready(cover.getSnapshot());
    inner.set("captions", new Map([[2, "海边"]]));
    expect(session.isReady("inner")).toBe(true);
    const inactiveCover = cover.getSnapshot();
    session.setPose(90, true);
    cover.ready(cover.getSnapshot());
    session.setPose(0, false);
    expect(session.isReady("cover")).toBe(false);
    cover.ready(inactiveCover);
    expect(session.isReady("cover")).toBe(false);
    cover.ready(cover.getSnapshot());
    expect(session.isReady("cover")).toBe(true);
    cover.set("captions", new Map([[2, "海边的中文说明"]]));
    expect(session.isReady("cover")).toBe(true);
    session.setPose(180, false);
    expect(session.isReady("inner")).toBe(false);
    inner.ready(inner.getSnapshot());
    expect(session.isReady("inner")).toBe(true);
    expect(inner.getSnapshot().state.captions.get(2)).toBe("海边的中文说明");
  } finally {
    session.dispose();
  }
});
