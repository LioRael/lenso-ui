"use client";
import {
  useLayoutEffect,
  useRef,
  useState,
  type DragEvent,
  type Key,
  type KeyboardEvent,
} from "react";
import { createCollectionDrag, type CollectionDragAndDrop } from "@lenso/primitives/table/core";
export type { CollectionDragAndDrop, CollectionDrop } from "@lenso/primitives/table/core";

export function useCollectionDrag(
  configuration: CollectionDragAndDrop | undefined,
  selected: ReadonlySet<Key>,
  enabledKeys: () => Key[],
  focus: (key: Key) => void,
) {
  const options = useRef({ configuration, selected, enabledKeys, focus });
  const controller = useRef<ReturnType<typeof createCollectionDrag>>(undefined);
  const [announcement, announce] = useState("");
  useLayoutEffect(() => {
    options.current = { configuration, selected, enabledKeys, focus };
    controller.current ??= createCollectionDrag({
      configuration: () => options.current.configuration,
      selected: () => options.current.selected,
      enabledKeys: () => options.current.enabledKeys(),
      focus: (key) => options.current.focus(key),
      announce,
    });
  }, [configuration, selected, enabledKeys, focus]);
  return {
    enabled: Boolean(configuration?.onReorder || configuration?.getItems),
    announcement,
    start(event: DragEvent<HTMLElement>, key: Key) {
      controller.current?.start(event.nativeEvent, key);
      if (event.nativeEvent.defaultPrevented) event.preventDefault();
    },
    over(event: DragEvent<HTMLElement>, key: Key) {
      controller.current?.over(event.nativeEvent, key);
      if (event.nativeEvent.defaultPrevented) event.preventDefault();
    },
    drop(event: DragEvent<HTMLElement>, key: Key) {
      controller.current?.drop(event.nativeEvent, key, event.currentTarget);
      if (event.nativeEvent.defaultPrevented) event.preventDefault();
    },
    end: () => controller.current?.end(),
    keyDown(event: KeyboardEvent<HTMLElement>, key: Key) {
      const handled = controller.current?.keyDown(event.nativeEvent, key) ?? false;
      if (handled) event.preventDefault();
      return handled;
    },
  };
}
