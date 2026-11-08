import { useCallback, type Ref } from "react";
import { assignRef } from "./ref.js";

const documents = new WeakMap<Document, { users: number; dispose: () => void }>();

function observe(document: Document) {
  let shared = documents.get(document);
  if (!shared) {
    const element = document.documentElement;
    const setMethod = (method: "pointer" | "keyboard") => {
      if (element.getAttribute("data-lenso-focus-method") !== method)
        element.setAttribute("data-lenso-focus-method", method);
    };
    const pointer = () => setMethod("pointer");
    const keyboard = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const editing =
        event.target instanceof Element &&
        event.target.matches("input, textarea, [contenteditable], [role='spinbutton']");
      if (
        event.key === "Tab" ||
        (!editing && !["Shift", "Control", "Alt", "Meta"].includes(event.key))
      )
        setMethod("keyboard");
    };
    document.addEventListener("pointerdown", pointer, true);
    document.addEventListener("keydown", keyboard, true);
    shared = {
      users: 0,
      dispose: () => {
        document.removeEventListener("pointerdown", pointer, true);
        document.removeEventListener("keydown", keyboard, true);
        element.removeAttribute("data-lenso-focus-method");
      },
    };
    documents.set(document, shared);
  }
  shared.users++;
  return () => {
    if (--shared.users === 0) {
      shared.dispose();
      documents.delete(document);
    }
  };
}

export function useFocusMethodRef<T extends HTMLElement>(ref?: Ref<T>) {
  return useCallback(
    (node: T | null) => {
      const clearRef = assignRef(ref, node);
      const stop = node ? observe(node.ownerDocument) : undefined;
      return () => {
        clearRef();
        stop?.();
      };
    },
    [ref],
  );
}
