"use client";

import { useCallback, useEffect, useState, type Ref } from "react";
import { bindPress, type BindPressOptions } from "../motion/press.js";
import { assignRef } from "./ref.js";

export interface ElasticOptions extends BindPressOptions {
  enabled?: boolean;
}

/** Binds shared press motion independently of optical rendering. */
export function useElasticRef<T extends HTMLElement>(
  ref: Ref<T> | undefined,
  {
    enabled = true,
    capture,
    shouldStart,
    propertyPrefix = "--lg-press",
    grow,
    release,
    touchRelease,
  }: ElasticOptions = {},
) {
  const [element, setElement] = useState<T | null>(null);
  useEffect(
    () =>
      element && enabled
        ? bindPress(element, { shouldStart, propertyPrefix, capture, grow, release, touchRelease })
        : undefined,
    [element, enabled, capture, shouldStart, propertyPrefix, grow, release, touchRelease],
  );
  return useCallback(
    (node: T | null) => {
      setElement(node);
      const cleanup = assignRef(ref, node);
      return () => {
        setElement(null);
        cleanup();
      };
    },
    [ref],
  );
}
