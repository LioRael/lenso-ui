"use client";

import { createContext, useLayoutEffect, useRef, useState } from "react";
import type { DocumentationNavigationItem } from "./site-navigation";

type SidebarState = { top: number; branches: Record<string, boolean> };
const prefix = "lenso-docs:sidebar:v1:";
const limit = 32;
const memory = new Map<string, SidebarState>();

function read(key: string): SidebarState {
  const cached = memory.get(key);
  if (cached) return cached;
  try {
    const value = JSON.parse(sessionStorage.getItem(prefix + key) ?? "null");
    if (
      value &&
      Number.isFinite(value.top) &&
      value.top >= 0 &&
      value.branches &&
      typeof value.branches === "object"
    ) {
      return {
        top: value.top,
        branches: Object.fromEntries(
          Object.entries(value.branches).filter(([, open]) => typeof open === "boolean"),
        ) as Record<string, boolean>,
      };
    }
  } catch {
    // Storage can be disabled; the bounded in-memory cache still covers SPA navigation.
  }
  return { top: 0, branches: {} };
}

function write(key: string, value: SidebarState) {
  memory.delete(key);
  memory.set(key, value);
  while (memory.size > limit) memory.delete(memory.keys().next().value!);
  try {
    sessionStorage.setItem(prefix + key, JSON.stringify(value));
    const keys = Object.keys(sessionStorage).filter((entry) => entry.startsWith(prefix));
    for (const old of keys
      .filter((entry) => entry !== prefix + key)
      .slice(0, Math.max(0, keys.length - limit))) {
      sessionStorage.removeItem(old);
    }
  } catch {
    // No persistence permission or quota: keep navigation functional.
  }
}

/** The fallback uses the menu's common route directory, never the active article. */
export function sidebarScope(
  brand: { title: string; url: string },
  navigation: readonly DocumentationNavigationItem[],
  navigationStateKey?: string,
): string {
  if (navigationStateKey !== undefined) return JSON.stringify([brand.url, navigationStateKey]);
  const urls: string[] = [];
  const visit = (items: readonly DocumentationNavigationItem[]) => {
    for (const item of items) {
      if (item.url) urls.push(item.url.split(/[?#]/)[0]!);
      if (item.children) visit(item.children);
    }
  };
  visit(navigation);
  const directories = urls.map((url) => url.split("/").slice(0, -1));
  const common: string[] = [];
  for (const [index, segment] of (directories[0] ?? []).entries()) {
    if (!directories.every((directory) => directory[index] === segment)) break;
    common.push(segment);
  }
  return JSON.stringify([brand.url, brand.title, common.join("/"), urls[0] ?? ""]);
}

export const DesktopNavigationState = createContext<{
  branches: Record<string, boolean>;
  setBranch: (id: string, open: boolean) => void;
} | null>(null);

export function navigationBranchId(item: DocumentationNavigationItem, parent?: string): string {
  const id = JSON.stringify(item.url ?? item.title);
  return parent === undefined ? id : `${parent}/${id}`;
}

function initialBranches(
  items: readonly DocumentationNavigationItem[],
  currentUrl: string,
  parent?: string,
): Record<string, boolean> {
  const containsCurrent = (item: DocumentationNavigationItem): boolean =>
    item.url === currentUrl || (item.children?.some(containsCurrent) ?? false);
  const branches: Record<string, boolean> = {};
  for (const item of items) {
    if (!item.children?.length) continue;
    const id = navigationBranchId(item, parent);
    branches[id] = item.defaultOpen ?? containsCurrent(item);
    Object.assign(branches, initialBranches(item.children, currentUrl, id));
  }
  return branches;
}

export function useSidebarState(
  key: string,
  navigation: readonly DocumentationNavigationItem[],
  currentUrl: string,
) {
  const ref = useRef<HTMLElement>(null);
  const [branches, setBranches] = useState<Record<string, boolean>>({});
  const state = useRef<SidebarState>({ top: 0, branches: {} });
  const restore = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const stored = read(key);
    state.current = {
      ...stored,
      branches: { ...initialBranches(navigation, currentUrl), ...stored.branches },
    };
    write(key, state.current);
    setBranches(state.current.branches);
    let visible = false;
    let restoring = false;
    let clamped = false;
    let frame = 0;
    const isVisible = () => element.getClientRects().length > 0 && element.clientHeight > 0;
    const apply = () => {
      if (!isVisible()) return;
      visible = true;
      restoring = true;
      clamped = state.current.top > element.scrollHeight - element.clientHeight;
      element.scrollTop = Math.min(
        state.current.top,
        Math.max(0, element.scrollHeight - element.clientHeight),
      );
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        restoring = false;
      });
    };
    restore.current = apply;
    apply();
    const save = () => {
      if (!isVisible() || restoring) return;
      clamped = false;
      state.current = { ...state.current, top: element.scrollTop };
      write(key, state.current);
    };
    const observer = new ResizeObserver(() => {
      if (isVisible() && (!visible || clamped)) apply();
      visible = isVisible();
    });
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    element.addEventListener("scroll", save, { passive: true });
    window.addEventListener("pagehide", save);
    return () => {
      // Use the captured node, not ref.current (React may already have cleared it).
      save();
      cancelAnimationFrame(frame);
      observer.disconnect();
      element.removeEventListener("scroll", save);
      window.removeEventListener("pagehide", save);
      restore.current = null;
    };
  }, [key, navigation, currentUrl]);

  useLayoutEffect(() => {
    restore.current?.();
  }, [branches]);

  const setBranch = (id: string, open: boolean) => {
    const next = { ...state.current.branches, [id]: open };
    state.current = { ...state.current, branches: next };
    write(key, state.current);
    setBranches(next);
  };
  return { ref, branches, setBranch };
}
