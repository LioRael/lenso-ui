"use client";
import { createContext, useContext } from "react";
export const PlaygroundLog = createContext<((...values: unknown[]) => void) | undefined>(undefined);
export function usePlaygroundLog() {
  return useContext(PlaygroundLog) ?? console.log;
}
