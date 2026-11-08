"use client";
import * as React from "react";

export interface CollectionDrop {
  keys: ReadonlySet<React.Key>;
  targetKey: React.Key;
  dropPosition: "before" | "after";
}
export interface CollectionDragAndDrop {
  onReorder?: (drop: CollectionDrop) => void;
  getItems?: (keys: ReadonlySet<React.Key>) => readonly Record<string, string>[];
  onDrop?: (
    drop: Omit<CollectionDrop, "keys"> & { items: readonly Record<string, string>[] },
  ) => void;
}
const mime = "application/x-lenso-collection";
export function useCollectionDrag(
  configuration: CollectionDragAndDrop | undefined,
  selected: ReadonlySet<React.Key>,
  enabledKeys: () => React.Key[],
  focus: (key: React.Key) => void,
) {
  const keys = React.useRef<ReadonlySet<React.Key>>(new Set());
  const [dragging, setDragging] = React.useState(false);
  const [announcement, announce] = React.useState("");
  const begin = (key: React.Key) => {
    const enabled = new Set(enabledKeys());
    keys.current = new Set(
      (selected.has(key) ? [...selected] : [key]).filter((entry) => enabled.has(entry)),
    );
    setDragging(true);
    announce(
      "Dragging items. Use arrow keys to choose a target, Enter to drop, or Escape to cancel.",
    );
  };
  const complete = (targetKey: React.Key, dropPosition: "before" | "after") => {
    if (keys.current.size && !keys.current.has(targetKey))
      configuration?.onReorder?.({ keys: new Set(keys.current), targetKey, dropPosition });
    keys.current = new Set();
    setDragging(false);
    announce("Drop complete.");
  };
  return {
    enabled: !!configuration?.onReorder || !!configuration?.getItems,
    announcement,
    dragging,
    start(event: React.DragEvent<HTMLElement>, key: React.Key) {
      if (!configuration) return;
      if (!enabledKeys().includes(key)) {
        event.preventDefault();
        return;
      }
      begin(key);
      event.dataTransfer.effectAllowed = configuration.onReorder ? "move" : "copy";
      event.dataTransfer.setData(
        mime,
        JSON.stringify(configuration.getItems?.(keys.current) ?? []),
      );
      event.dataTransfer.setData(
        "text/plain",
        configuration
          .getItems?.(keys.current)
          ?.map((item) => item["text/plain"] ?? "")
          .join("\n") ?? String(key),
      );
    },
    over(event: React.DragEvent<HTMLElement>, key: React.Key) {
      if (
        configuration &&
        enabledKeys().includes(key) &&
        (configuration.onReorder || configuration.onDrop)
      )
        event.preventDefault();
    },
    drop(event: React.DragEvent<HTMLElement>, key: React.Key) {
      if (!configuration || !enabledKeys().includes(key)) return;
      event.preventDefault();
      const bounds = event.currentTarget.getBoundingClientRect();
      const position = event.clientY < bounds.top + bounds.height / 2 ? "before" : "after";
      if (keys.current.size) complete(key, position);
      else if (configuration.onDrop) {
        const value = event.dataTransfer.getData(mime);
        let items: unknown;
        try {
          items = value
            ? JSON.parse(value)
            : [{ "text/plain": event.dataTransfer.getData("text/plain") }];
        } catch {
          return;
        }
        if (
          Array.isArray(items) &&
          items.every(
            (item) =>
              item &&
              typeof item === "object" &&
              Object.values(item).every((entry) => typeof entry === "string"),
          )
        )
          configuration.onDrop({ targetKey: key, dropPosition: position, items });
      }
    },
    end() {
      keys.current = new Set();
      setDragging(false);
    },
    keyDown(event: React.KeyboardEvent<HTMLElement>, key: React.Key) {
      if (!configuration) return false;
      if (
        !dragging &&
        event.key === "Enter" &&
        (event.target as HTMLElement).closest('[slot="drag"]')
      ) {
        event.preventDefault();
        begin(key);
        return true;
      }
      if (!dragging) return false;
      if (event.key === "Escape") {
        event.preventDefault();
        keys.current = new Set();
        setDragging(false);
        announce("Drag cancelled.");
        return true;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        complete(key, "before");
        return true;
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const available = enabledKeys().filter((entry) => !keys.current.has(entry));
        const index = available.indexOf(key);
        const next =
          available[
            Math.max(
              0,
              Math.min(available.length - 1, index + (event.key === "ArrowDown" ? 1 : -1)),
            )
          ];
        if (next !== undefined) {
          focus(next);
          announce(`Drop before ${String(next)}. Press Enter to drop.`);
        }
        return true;
      }
      return false;
    },
  };
}
