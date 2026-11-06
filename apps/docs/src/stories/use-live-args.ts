"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useDataEngine, type DataEngine } from "@fumari/stf";

function createArgsStore(engine: DataEngine) {
  let snapshot = { ...engine.getData() } as Record<string, unknown>;
  return {
    read: () => snapshot,
    subscribe(notify: () => void) {
      const update = () => {
        snapshot = { ...engine.getData() };
        notify();
      };
      const listener = { onUpdate: update, onInit: update, onDelete: update };
      engine.listen(listener);
      update();
      return () => engine.unlisten(listener);
    },
  };
}

// Interactive controls need synchronous feedback rather than Story's debounced
// argument hook, which can roll back controlled input and pointer gestures.
export function useLiveArgs() {
  const engine = useDataEngine();
  const store = useMemo(() => createArgsStore(engine), [engine]);
  return useSyncExternalStore(store.subscribe, store.read, store.read);
}
