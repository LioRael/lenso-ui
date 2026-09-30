"use client";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const snapshot = () => true;
const serverSnapshot = () => false;

/** Adapted from HeroUI v3.2.6 (Apache-2.0). */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
