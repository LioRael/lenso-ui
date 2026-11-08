"use client";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const snapshot = () => true;
const serverSnapshot = () => false;

export function useIsHydrated(): boolean {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
