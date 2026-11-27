import type { TableKey } from "./column-layout.js";

export interface CollectionDrop {
  keys: ReadonlySet<TableKey>;
  targetKey: TableKey;
  dropPosition: "before" | "after";
}
export interface CollectionDragAndDrop {
  onReorder?: (drop: CollectionDrop) => void;
  getItems?: (keys: ReadonlySet<TableKey>) => readonly Record<string, string>[];
  onDrop?: (
    drop: Omit<CollectionDrop, "keys"> & { items: readonly Record<string, string>[] },
  ) => void;
}

const mime = "application/x-lenso-collection";

export function createCollectionDrag(options: {
  configuration: () => CollectionDragAndDrop | undefined;
  selected: () => ReadonlySet<TableKey>;
  enabledKeys: () => TableKey[];
  focus: (key: TableKey) => void;
  announce: (message: string) => void;
}) {
  let keys = new Set<TableKey>();
  let keyboard = false;

  function end() {
    keys.clear();
    keyboard = false;
  }
  function begin(key: TableKey) {
    const enabled = new Set(options.enabledKeys());
    if (!enabled.has(key)) return false;
    const selected = options.selected();
    keys = new Set(
      (selected.has(key) ? [...selected] : [key]).filter((entry) => enabled.has(entry)),
    );
    return true;
  }
  function complete(targetKey: TableKey, dropPosition: CollectionDrop["dropPosition"]) {
    const keySet = new Set(keys);
    const reorder = options.configuration()?.onReorder;
    end();
    if (reorder && keySet.size && !keySet.has(targetKey)) {
      reorder({ keys: keySet, targetKey, dropPosition });
      options.announce("Drop complete.");
    } else options.announce("Drag cancelled.");
  }

  return {
    enabled() {
      const configuration = options.configuration();
      return Boolean(configuration?.onReorder || configuration?.getItems);
    },
    start(event: DragEvent, key: TableKey) {
      const configuration = options.configuration();
      if (
        (!configuration?.onReorder && !configuration?.getItems) ||
        !event.dataTransfer ||
        !begin(key)
      ) {
        event.preventDefault();
        return;
      }
      keyboard = false;
      const items = configuration.getItems?.(keys) ?? [];
      event.dataTransfer.effectAllowed = configuration.onReorder ? "move" : "copy";
      event.dataTransfer.setData(mime, JSON.stringify(items));
      event.dataTransfer.setData(
        "text/plain",
        items.length ? items.map((item) => item["text/plain"] ?? "").join("\n") : String(key),
      );
    },
    over(event: DragEvent, key: TableKey) {
      const config = options.configuration();
      if (
        options.enabledKeys().includes(key) &&
        (keys.size ? config?.onReorder && !keys.has(key) : config?.onDrop)
      )
        event.preventDefault();
    },
    drop(event: DragEvent, key: TableKey, row: HTMLElement) {
      const config = options.configuration();
      if (!config || !options.enabledKeys().includes(key)) return;
      const bounds = row.getBoundingClientRect();
      const position = event.clientY < bounds.top + bounds.height / 2 ? "before" : "after";
      if (keys.size && config.onReorder) {
        event.preventDefault();
        complete(key, position);
      } else if (config.onDrop && event.dataTransfer) {
        event.preventDefault();
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
              !Array.isArray(item) &&
              Object.values(item).every((entry) => typeof entry === "string"),
          )
        )
          config.onDrop({ targetKey: key, dropPosition: position, items });
      }
    },
    end,
    keyDown(event: KeyboardEvent, key: TableKey) {
      if (!options.configuration()?.onReorder) return false;
      if (!keyboard) {
        if (
          (event.key !== "Enter" && event.key !== " ") ||
          !(
            event.target instanceof Element &&
            event.target.closest('[slot="drag"],[data-table-drag]')
          ) ||
          !begin(key)
        )
          return false;
        event.preventDefault();
        keyboard = true;
        options.announce(
          "Dragging items. Use arrow keys to choose a target, Enter to drop, or Escape to cancel.",
        );
        return true;
      }
      if (event.key === "Escape" || event.key === "Tab") {
        end();
        options.announce("Drag cancelled.");
        if (event.key === "Tab") return false;
      } else if (event.key === "Enter" || event.key === " ") complete(key, "before");
      else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        const direction = event.key === "ArrowDown" ? 1 : -1;
        const all = options.enabledKeys();
        const index = all.indexOf(key);
        const next = (direction === 1 ? all.slice(index + 1) : all.slice(0, index).reverse()).find(
          (item) => !keys.has(item),
        );
        if (next !== undefined) {
          options.focus(next);
          options.announce(`Drop before ${String(next)}. Press Enter to drop.`);
        }
      } else return false;
      event.preventDefault();
      return true;
    },
  };
}
