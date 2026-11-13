"use client";

import { useCallback, useEffect, useState, type Ref } from "react";
import { press, type PressOptions } from "../motion/press.js";
import { assignRef } from "./ref.js";

export interface ElasticOptions extends PressOptions {
  enabled?: boolean;
  shouldStart?: (event: PointerEvent) => boolean;
  propertyPrefix?: string;
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
        ? press(element, shouldStart, propertyPrefix, { capture, grow, release, touchRelease })
        : undefined,
    [element, enabled, capture, shouldStart, propertyPrefix, grow, release, touchRelease],
  );
  return useCallback(
    (node: T | null) => {
      setElement(node);
      return assignRef(ref, node);
    },
    [ref],
  );
}
