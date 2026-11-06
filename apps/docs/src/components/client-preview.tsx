"use client";

import { useSyncExternalStore, type ReactNode } from "react";

const subscribe = () => () => {};
const client = () => true;
const server = () => false;

/** Time-dependent examples must not hydrate against a stale static export. */
export function ClientPreview({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return useSyncExternalStore(subscribe, client, server) ? children : fallback;
}
