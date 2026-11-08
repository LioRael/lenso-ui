"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useId,
  useRef,
  useState,
  type Key,
  type KeyboardEvent,
} from "react";
import type { CollectionDrop } from "../list-box/drag-and-drop.js";

export type ListReorderDetails = CollectionDrop;
export interface ListEditingProps {
  editing?: boolean;
  disabled?: boolean;
  selectedKeys?: ReadonlySet<Key>;
  defaultSelectedKeys?: ReadonlySet<Key>;
  onSelectionChange?: (keys: Set<Key>) => void;
  onReorder?: (details: ListReorderDetails) => void;
}
type Entry = { key: Key; text: string; node: HTMLLIElement; disabled: boolean; group?: string };
type Target = { key: Key; position: "before" | "after" };
type Session = {
  key: Key;
  mode: "pointer" | "keyboard";
  target: Target | null;
  handle: HTMLElement;
  pointer?: number;
  startY: number;
  y: number;
  startScroll: number;
  scroll: HTMLElement;
  transform: string;
  base: string;
  maxScroll: number;
};
function scrollOwner(node: HTMLElement) {
  for (let parent = node.parentElement; parent; parent = parent.parentElement)
    if (
      /auto|scroll/.test(getComputedStyle(parent).overflowY) &&
      parent.scrollHeight > parent.clientHeight
    )
      return parent;
  return node.ownerDocument.scrollingElement as HTMLElement;
}
export function useListEditing({
  editing = false,
  disabled = false,
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  onReorder,
}: ListEditingProps) {
  const [local, setLocal] = useState<ReadonlySet<Key>>(() => new Set(defaultSelectedKeys));
  const selected = selectedKeys ?? local;
  const entries = useRef(new Map<Key, Entry>());
  const [revision, setRevision] = useState(0);
  const [open, setOpen] = useState<{ key: Key; side: "start" | "end" } | null>(null);
  const [drag, setDrag] = useState<{ key: Key; target: Target | null } | null>(null);
  const [announcement, announce] = useState("");
  const session = useRef<Session | null>(null);
  const frame = useRef(0);
  const pendingFocus = useRef<HTMLElement | null>(null);
  const instructionsId = useId();
  const register = useCallback((entry: Entry) => {
    if (entries.current.has(entry.key))
      throw new Error(`Duplicate List itemKey: ${String(entry.key)}`);
    entries.current.set(entry.key, entry);
    setRevision((v) => v + 1);
    return () => {
      entries.current.delete(entry.key);
      setRevision((v) => v + 1);
    };
  }, []);
  const ordered = () =>
    [...entries.current.values()]
      .filter((e) => !e.disabled)
      .sort((a, b) =>
        a.node.compareDocumentPosition(b.node) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      );
  const select = (keys: Set<Key>) => {
    if (disabled) return;
    if (selectedKeys === undefined) setLocal(keys);
    onSelectionChange?.(keys);
  };
  const setChecked = (key: Key, checked: boolean) => {
    if (!editing || disabled || entries.current.get(key)?.disabled) return;
    if (selected.has(key) === checked) return;
    const next = new Set(selected);
    if (checked) next.add(key);
    else next.delete(key);
    select(next);
  };
  const restore = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    const old = session.current;
    session.current = null;
    if (old) {
      const node = entries.current.get(old.key)?.node;
      if (node) node.style.transform = old.transform;
      if (old.pointer !== undefined && old.handle.hasPointerCapture(old.pointer))
        old.handle.releasePointerCapture(old.pointer);
    }
    return old;
  }, []);
  useEffect(
    () => () => {
      restore();
    },
    [restore],
  );
  useEffect(() => {
    if (!editing || disabled || !onReorder) {
      restore();
      // oxlint-disable-next-line react/set-state-in-effect -- Mode changes cancel native capture and discard its visual drag session.
      setDrag(null);
    }
    if (editing || disabled) setOpen(null);
  }, [editing, disabled, onReorder, restore]);
  useLayoutEffect(() => {
    if (pendingFocus.current?.isConnected) {
      pendingFocus.current.focus({ preventScroll: true });
      pendingFocus.current = null;
    }
  });
  useEffect(() => {
    if (selectedKeys === undefined)
      setLocal((previous) => {
        const next = new Set([...previous].filter((key) => entries.current.has(key)));
        return next.size === previous.size ? previous : next;
      });
    if (session.current && !entries.current.has(session.current.key)) {
      restore();
      setDrag(null);
    }
  }, [revision, selectedKeys, restore]);
  const cancel = () => {
    restore();
    setDrag(null);
    announce("Move cancelled.");
  };
  const finish = () => {
    const old = restore();
    setDrag(null);
    if (!old) return;
    if (old.target && editing && !disabled) {
      onReorder?.({
        keys: new Set([old.key]),
        targetKey: old.target.key,
        dropPosition: old.target.position,
      });
      announce(
        `Move requested ${old.target.position} ${entries.current.get(old.target.key)?.text ?? "item"}.`,
      );
    } else announce("Order unchanged.");
    if (old.mode === "keyboard") pendingFocus.current = old.handle;
  };
  const begin = (key: Key, handle: HTMLElement, mode: Session["mode"], y = 0, pointer?: number) => {
    const entry = entries.current.get(key);
    if (!editing || disabled || !onReorder || !entry || entry.disabled || session.current) return;
    const scroll = scrollOwner(entry.node);
    const base = getComputedStyle(entry.node).transform;
    session.current = {
      key,
      handle,
      mode,
      pointer,
      startY: y,
      y,
      startScroll: scroll.scrollTop,
      scroll,
      target: null,
      transform: entry.node.style.transform,
      base: base === "none" ? "" : base,
      maxScroll: scroll.scrollHeight - scroll.clientHeight,
    };
    setOpen(null);
    setDrag({ key, target: null });
    announce(`Moving ${entry.text}. Use Up or Down, Enter to place, or Escape to cancel.`);
    handle.focus({ preventScroll: true });
    if (pointer !== undefined) handle.setPointerCapture(pointer);
  };
  const updatePointer = () => {
    const active = session.current;
    if (!active || active.mode !== "pointer") return;
    const source = entries.current.get(active.key);
    if (!source) return;
    const candidates = ordered()
      .filter((entry) => entry.key !== active.key && entry.group === source.group)
      .map((entry) => {
        const rect = entry.node.getBoundingClientRect();
        return { entry, rect, distance: Math.abs(active.y - rect.top - rect.height / 2) };
      })
      .sort((a, b) => a.distance - b.distance);
    const nearest = candidates[0];
    const target: Target | null = nearest
      ? {
          key: nearest.entry.key,
          position: active.y < nearest.rect.top + nearest.rect.height / 2 ? "before" : "after",
        }
      : null;
    const changed =
      target?.key !== active.target?.key || target?.position !== active.target?.position;
    active.target = target;
    source.node.style.transform = `${active.base} translateY(${active.y - active.startY + active.scroll.scrollTop - active.startScroll}px)`;
    if (changed) setDrag({ key: active.key, target });
  };
  const autoScroll = () => {
    frame.current = 0;
    const active = session.current;
    if (!active || active.mode !== "pointer") return;
    const rect =
      active.scroll === active.scroll.ownerDocument.scrollingElement
        ? { top: 0, bottom: window.innerHeight }
        : active.scroll.getBoundingClientRect();
    const delta = active.y < rect.top + 36 ? -12 : active.y > rect.bottom - 36 ? 12 : 0;
    if (!delta) return;
    const previous = active.scroll.scrollTop;
    active.scroll.scrollTop = Math.max(0, Math.min(active.maxScroll, previous + delta));
    if (active.scroll.scrollTop !== previous) {
      updatePointer();
      frame.current = requestAnimationFrame(autoScroll);
    }
  };
  return {
    editing,
    disabled,
    selected,
    open: editing || disabled ? null : open,
    setOpen,
    dismissOtherRow(target: Node) {
      if (
        !open ||
        editing ||
        !(target instanceof Element) ||
        target.closest(
          "[data-swipe-trigger],[data-swipe-action],[data-list-selection],[data-list-reorder]",
        )
      )
        return false;
      if (
        [...entries.current.values()].some(
          (entry) => entry.key !== open.key && entry.node.contains(target),
        )
      ) {
        setOpen(null);
        return true;
      }
      return false;
    },
    register,
    setChecked,
    canReorder: !!onReorder,
    drag,
    announcement,
    instructionsId,
    selectAll() {
      select(new Set(ordered().map((entry) => entry.key)));
    },
    pointerDown(key: Key, handle: HTMLElement, id: number, y: number) {
      begin(key, handle, "pointer", y, id);
    },
    pointerMove(id: number, y: number) {
      const active = session.current;
      if (!active || active.pointer !== id) return;
      active.y = y;
      updatePointer();
      if (!frame.current) frame.current = requestAnimationFrame(autoScroll);
    },
    pointerEnd(id: number, cancelled: boolean) {
      if (session.current?.pointer === id) {
        if (cancelled) cancel();
        else finish();
      }
    },
    keyDown(key: Key, handle: HTMLElement, event: KeyboardEvent<HTMLElement>) {
      if (event.key === "Escape" && session.current) {
        event.preventDefault();
        cancel();
        return;
      }
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        if (session.current?.mode === "keyboard") finish();
        else begin(key, handle, "keyboard");
        return;
      }
      const active = session.current;
      if (active?.mode !== "keyboard" || (event.key !== "ArrowUp" && event.key !== "ArrowDown"))
        return;
      event.preventDefault();
      const source = entries.current.get(active.key)!;
      const all = ordered().filter((entry) => entry.group === source.group);
      const at = active.target
        ? all.findIndex((entry) => entry.key === active.target!.key)
        : all.findIndex((entry) => entry.key === active.key);
      const next =
        all[Math.max(0, Math.min(all.length - 1, at + (event.key === "ArrowDown" ? 1 : -1)))];
      active.target =
        next && next.key !== active.key
          ? { key: next.key, position: event.key === "ArrowDown" ? "after" : "before" }
          : null;
      setDrag({ key: active.key, target: active.target });
      announce(
        active.target
          ? `Place ${active.target.position} ${next!.text}. Press Enter to confirm.`
          : "Original position.",
      );
    },
    activateHandle(key: Key, handle: HTMLElement) {
      if (session.current?.mode === "keyboard") finish();
      else begin(key, handle, "keyboard");
    },
    blurHandle(key: Key) {
      if (session.current?.key === key && session.current.mode === "keyboard") cancel();
    },
  };
}
export type ListModel = ReturnType<typeof useListEditing>;
export const ListContext = createContext<ListModel | null>(null);
export const ListSectionContext = createContext<string | undefined>(undefined);
export const ListRowContext = createContext({ editing: false, disabled: false });
export const useListContext = () => useContext(ListContext);
