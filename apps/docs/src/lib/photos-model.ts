import { useCallback, useSyncExternalStore, type SetStateAction } from "react";
import { library, type DemoPhoto } from "./photos-library";
import {
  commitEdit,
  hasAdjustments,
  orientedSize,
  originalAdjustments,
  renderPhotoEdit,
  sameAdjustments,
  type EditHistory,
  type PhotoAdjustments,
  type PhotoEdit,
} from "./photos-adjustments";
import type { PhotoFilter } from "../components/photos-library-menu";
import type { LibraryView } from "../components/photos-library-overview";

export type PhotosSurface = "inner" | "inner-right" | "cover" | "standalone";
type Destination = "library" | "collections" | "search";
export type PhotosEditorState = {
  photoId: number;
  initial: PhotoAdjustments;
  draft: PhotoAdjustments;
  history: EditHistory;
  tool: "exposure" | "brightness" | "contrast" | "saturation" | "warmth" | "tint";
  mode: "adjust" | "filters" | "crop";
  comparing: boolean;
  confirm: boolean;
  saving: boolean;
  error: string;
  aspect: number;
  portraitCrop: boolean;
  showRatios: boolean;
  dimensions: { width: number; height: number };
};
export function createPhotosEditorState(
  photo: DemoPhoto,
  initial: PhotoAdjustments,
): PhotosEditorState {
  return {
    photoId: photo.id,
    initial,
    draft: initial,
    history: { past: [], present: initial, future: [] },
    tool: "exposure",
    mode: "adjust",
    comparing: false,
    confirm: false,
    saving: false,
    error: "",
    aspect: 0,
    portraitCrop: photo.height > photo.width,
    showRatios: false,
    dimensions: { width: photo.width, height: photo.height },
  };
}
export type PhotosState = {
  editor: PhotosEditorState | null;
  informationOpen: boolean;
  viewerMenu: "root" | "album" | "information" | null;
  viewerConfirmation: { kind: "delete" | "revert" | "hide"; id: number; open: boolean } | null;
  destination: Destination;
  query: string;
  recentSearches: string[];
  collection: string | null;
  favorites: Set<number>;
  deleted: Set<number>;
  sources: DemoPhoto[];
  hiddenPhotos: Set<number>;
  lastHidden: number | null;
  lastDeleted: number[];
  selected: number | null;
  viewerPhotos: DemoPhoto[];
  libraryView: LibraryView;
  navigationMinimized: boolean;
  dense: boolean;
  dark: boolean;
  selecting: boolean;
  selection: Set<number>;
  edits: Map<number, PhotoEdit>;
  captions: Map<number, string>;
  filter: PhotoFilter;
  cropped: boolean;
  albums: Map<string, Set<number>>;
  notice: string;
  scrollAnchor: { id: number; offset: number } | null;
  selectionAnchor: number | null;
  searchOrigin: {
    destination: Destination;
    collection: string | null;
    top: number;
    minimized: boolean;
    anchor: PhotosState["scrollAnchor"];
  };
};
type Snapshot = Readonly<{ revision: number; state: PhotosState; interactive: boolean }>;
export type PhotosModel = {
  readonly surface: PhotosSurface;
  subscribe(listener: () => void): () => void;
  getSnapshot(): Snapshot;
  set<K extends keyof PhotosState>(key: K, value: SetStateAction<PhotosState[K]>): void;
  ready(snapshot: Snapshot): void;
  saveEdit(id: number, edit: PhotoEdit | undefined): void;
  openEditor(id: number): void;
  changeEditor(value: SetStateAction<PhotosEditorState>): void;
  closeEditor(): void;
  saveEditor(): Promise<void>;
  duplicatePhoto(id: number): Promise<void>;
  registerTextInput(
    field: "search" | number,
    input: HTMLInputElement | HTMLTextAreaElement,
  ): () => void;
};

export function createPhotosSession() {
  let state: PhotosState = {
    editor: null,
    informationOpen: false,
    viewerMenu: null,
    viewerConfirmation: null,
    destination: "library",
    query: "",
    recentSearches: [],
    collection: null,
    favorites: new Set([2, 8, 14]),
    deleted: new Set(),
    sources: library,
    hiddenPhotos: new Set(),
    lastHidden: null,
    lastDeleted: [],
    selected: null,
    viewerPhotos: library,
    libraryView: "all",
    navigationMinimized: false,
    dense: true,
    dark: false,
    selecting: false,
    selection: new Set(),
    edits: new Map(),
    captions: new Map(),
    filter: "all",
    cropped: true,
    albums: new Map(),
    notice: "",
    scrollAnchor: null,
    selectionAnchor: null,
    searchOrigin: {
      destination: "library",
      collection: null,
      top: 0,
      minimized: false,
      anchor: null,
    },
  };
  let revision = 0;
  let frozen = { state, revision };
  let folding = false;
  let active: PhotosSurface | null = "inner";
  const listeners = new Set<() => void>();
  const paintListeners = new Set<() => void>();
  const views = new Map<
    PhotosSurface,
    { model?: PhotosModel; snapshot: Snapshot; ready: number; painted: boolean }
  >();
  let nextPhotoId = library.length;
  const editUrls = new Map<number, string>();
  let generation = 0;
  type TextInput = {
    field: "search" | number;
    input: HTMLInputElement | HTMLTextAreaElement;
    surface: PhotosSurface;
  };
  let lastInput: TextInput | null = null;
  let composing: TextInput | null = null;
  let pendingHandoff: (() => void) | null = null;
  let focusBookmark: {
    field: "search" | number;
    start: number;
    end: number;
    direction: "forward" | "backward" | "none";
    automatic: boolean;
    value: string;
  } | null = null;
  const textInputs = new Set<TextInput>();
  function rememberInput() {
    if (!lastInput || lastInput.surface !== active) return;
    const { input, field } = lastInput;
    const focused = input.ownerDocument.activeElement;
    if (focused !== input && focused !== input.ownerDocument.body) {
      focusBookmark = null;
      return;
    }
    focusBookmark = {
      field,
      start: input.selectionStart ?? 0,
      end: input.selectionEnd ?? 0,
      direction: input.selectionDirection ?? "none",
      automatic: focused === input && input.ownerDocument.hasFocus(),
      value: input.value,
    };
  }
  function restoreSelection(record: TextInput) {
    const bookmark = focusBookmark;
    if (!bookmark || bookmark.field !== record.field || bookmark.value !== record.input.value)
      return;
    const value = record.input.value;
    // WebKit can reset the caret after dispatching focus.
    record.input.ownerDocument.defaultView?.requestAnimationFrame(() => {
      if (focusBookmark !== bookmark || record.input.ownerDocument.activeElement !== record.input)
        return;
      if (record.input.value === value)
        record.input.setSelectionRange(bookmark.start, bookmark.end, bookmark.direction);
      focusBookmark = null;
    });
  }
  function restoreFocus(record: TextInput, entering = false) {
    const bookmark = focusBookmark;
    if (!bookmark || bookmark.field !== record.field || record.surface !== active) return;
    if (!bookmark.automatic && !entering) return;
    const win = record.input.ownerDocument.defaultView;
    win?.requestAnimationFrame(() => {
      if (focusBookmark !== bookmark || record.surface !== active || !record.input.isConnected)
        return;
      const frame = win.frameElement;
      const outer = frame?.ownerDocument;
      if (!outer || (outer.activeElement !== outer.body && outer.activeElement !== frame)) return;
      if (frame.closest("[inert]") || record.input.closest("[inert]")) return;
      record.input.focus({ preventScroll: true });
      restoreSelection(record);
    });
  }
  function publish() {
    for (const [surface, view] of views) {
      const snapshot = folding ? frozen : { state, revision };
      const interactive = surface === "standalone" || surface === active;
      // An old inactive paint cannot acknowledge the newly interactive presentation.
      if (view.snapshot.interactive !== interactive) view.painted = false;
      view.ready = -1;
      view.snapshot = { ...snapshot, interactive };
    }
    listeners.forEach((listener) => listener());
    paintListeners.forEach((listener) => listener());
  }
  function update<K extends keyof PhotosState>(key: K, value: SetStateAction<PhotosState[K]>) {
    const next = typeof value === "function" ? value(state[key]) : value;
    if (Object.is(next, state[key])) return;
    state = { ...state, [key]: next };
    if (key === "selected") state = { ...state, viewerMenu: null, viewerConfirmation: null };
    revision++;
    publish();
  }
  function saveEdit(id: number, edit: PhotoEdit | undefined) {
    const previous = editUrls.get(id);
    if (previous) URL.revokeObjectURL(previous);
    if (edit) editUrls.set(id, edit.src);
    else editUrls.delete(id);
    update("edits", (previous) => {
      const next = new Map(previous);
      if (edit) next.set(id, edit);
      else next.delete(id);
      return next;
    });
  }
  function screen(surface: PhotosSurface): PhotosModel {
    const existing = views.get(surface);
    if (existing?.model) return existing.model;
    const view: { model?: PhotosModel; snapshot: Snapshot; ready: number; painted: boolean } = {
      snapshot: {
        ...(folding ? frozen : { state, revision }),
        interactive: surface === "standalone" || surface === active,
      },
      ready: -1,
      painted: false,
    };
    const model: PhotosModel = {
      surface,
      subscribe(listener) {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
      getSnapshot: () => view.snapshot,
      registerTextInput(field, input) {
        const record = { field, input, surface };
        textInputs.add(record);
        const write = () => {
          if (!view.snapshot.interactive) return;
          if (field === "search") update("query", input.value);
          else if (state.captions.get(field) !== input.value)
            update("captions", (previous) => new Map(previous).set(field, input.value));
        };
        const focus = () => {
          if (!view.snapshot.interactive) return;
          lastInput = record;
          restoreSelection(record);
        };
        const start = () => {
          if (view.snapshot.interactive) {
            lastInput = record;
            composing = { ...record };
          }
        };
        const end = () => {
          if (composing?.input !== input) return;
          const composition = composing;
          // The final input event can follow compositionend in the same task.
          queueMicrotask(() => {
            if (composing !== composition) return;
            if (input.isConnected) write();
            composing = null;
            const action = pendingHandoff;
            pendingHandoff = null;
            action?.();
          });
        };
        const enter = () => restoreFocus(record, true);
        const point = () => {
          if (view.snapshot.interactive) focusBookmark = null;
        };
        input.addEventListener("focus", focus);
        input.addEventListener("pointerdown", point);
        input.addEventListener("compositionstart", start);
        input.addEventListener("compositionend", end);
        input.ownerDocument.defaultView?.addEventListener("focus", enter);
        if (input.ownerDocument.activeElement === input) focus();
        return () => {
          input.removeEventListener("focus", focus);
          input.removeEventListener("pointerdown", point);
          input.removeEventListener("compositionstart", start);
          input.removeEventListener("compositionend", end);
          input.ownerDocument.defaultView?.removeEventListener("focus", enter);
          textInputs.delete(record);
          if (composing?.input === input)
            queueMicrotask(() => {
              if (!input.isConnected) end();
            });
          queueMicrotask(() => {
            if (lastInput === record && !input.isConnected) lastInput = null;
          });
        };
      },
      set(key, value) {
        if (!view.snapshot.interactive) return;
        update(key, value);
      },
      saveEdit(id, edit) {
        if (view.snapshot.interactive) saveEdit(id, edit);
      },
      openEditor(id) {
        if (!view.snapshot.interactive || state.editor) return;
        const photo = state.sources.find((item) => item.id === id);
        if (photo)
          update(
            "editor",
            createPhotosEditorState(photo, state.edits.get(id)?.adjustments ?? originalAdjustments),
          );
      },
      changeEditor(value) {
        if (!view.snapshot.interactive || !state.editor || state.editor.saving) return;
        update("editor", typeof value === "function" ? value(state.editor) : value);
      },
      closeEditor() {
        if (view.snapshot.interactive && !state.editor?.saving) update("editor", null);
      },
      async saveEditor() {
        const editor = state.editor;
        if (
          !view.snapshot.interactive ||
          !editor ||
          editor.saving ||
          sameAdjustments(editor.initial, editor.draft)
        )
          return;
        const photo = state.sources.find((item) => item.id === editor.photoId);
        if (!photo) return;
        const commandGeneration = generation;
        update("editor", { ...editor, saving: true, error: "" });
        try {
          const blob = hasAdjustments(editor.draft)
            ? await renderPhotoEdit(photo, editor.draft)
            : null;
          if (commandGeneration !== generation) return;
          const size = orientedSize(
            editor.dimensions.width,
            editor.dimensions.height,
            editor.draft.rotation,
          );
          saveEdit(
            photo.id,
            blob
              ? {
                  src: URL.createObjectURL(blob),
                  adjustments: editor.draft,
                  width: Math.round(size.width * editor.draft.crop.width),
                  height: Math.round(size.height * editor.draft.crop.height),
                }
              : undefined,
          );
          update("editor", null);
        } catch {
          if (commandGeneration === generation)
            update("editor", {
              ...editor,
              saving: false,
              error: "Couldn’t save this edit. Please try again.",
            });
        }
      },
      async duplicatePhoto(id) {
        if (!view.snapshot.interactive) return;
        const commandGeneration = generation;
        const source = state.sources.find((photo) => photo.id === id);
        if (!source) return;
        const copyId = nextPhotoId++;
        const edit = state.edits.get(id);
        const favorite = state.favorites.has(id);
        const caption = state.captions.get(id);
        try {
          const blob = edit ? await (await fetch(edit.src)).blob() : null;
          if (commandGeneration !== generation) return;
          const copy = { ...source, id: copyId };
          update("sources", (previous) => [...previous, copy]);
          update("viewerPhotos", (previous) => [...previous, copy]);
          if (edit && blob) saveEdit(copyId, { ...edit, src: URL.createObjectURL(blob) });
          if (favorite) update("favorites", (previous) => new Set(previous).add(copyId));
          if (caption !== undefined)
            update("captions", (previous) => new Map(previous).set(copyId, caption));
          update("notice", "Photo duplicated in this sample library");
        } catch {
          update("notice", "Couldn't duplicate this photo. Try again.");
        }
      },
      ready(value) {
        if (value !== view.snapshot || value.revision === view.ready) return;
        view.ready = value.revision;
        view.painted = true;
        paintListeners.forEach((listener) => listener());
        for (const record of textInputs) if (record.surface === surface) restoreFocus(record);
      },
    };
    view.model = model;
    views.set(surface, view);
    return model;
  }
  return {
    screen,
    handoff(action: () => void) {
      const run = () => {
        rememberInput();
        action();
      };
      if (composing) pendingHandoff = run;
      else run();
    },
    setPose(angle: number, busy: boolean) {
      const nextFolding = busy || (angle > 0.5 && angle < 179.5);
      const nextActive = nextFolding ? null : angle >= 179.5 ? "inner" : "cover";
      if (nextFolding === folding && nextActive === active) return;
      if (nextFolding && !folding) {
        const editor = state.editor;
        if (editor) {
          const history = commitEdit(editor.history, editor.draft);
          if (history !== editor.history || editor.comparing) {
            state = { ...state, editor: { ...editor, history, comparing: false } };
            revision++;
          }
        }
        frozen = { state, revision };
      }
      folding = nextFolding;
      active = nextActive;
      publish();
    },
    isReady(surface: Exclude<PhotosSurface, "standalone">) {
      const ready = (name: PhotosSurface) => {
        const view = views.get(name);
        return Boolean(view && view.ready === view.snapshot.revision);
      };
      return folding && surface !== "cover"
        ? ready("inner") && ready("inner-right")
        : Boolean(views.get(surface)?.painted);
    },
    subscribePaint(listener: () => void) {
      paintListeners.add(listener);
      return () => {
        paintListeners.delete(listener);
      };
    },
    dispose() {
      generation++;
      composing = null;
      pendingHandoff = null;
      focusBookmark = null;
      textInputs.clear();
      editUrls.forEach((url) => URL.revokeObjectURL(url));
      editUrls.clear();
      listeners.clear();
      paintListeners.clear();
    },
  };
}

export function usePhotosField<K extends keyof PhotosState>(model: PhotosModel, key: K) {
  const snapshot = useSyncExternalStore(model.subscribe, model.getSnapshot, model.getSnapshot);
  const set = useCallback(
    (value: SetStateAction<PhotosState[K]>) => model.set(key, value),
    [model, key],
  );
  return [snapshot.state[key], set] as const;
}

export type PhotosFrame = HTMLIFrameElement & { photosModel?: PhotosModel };
