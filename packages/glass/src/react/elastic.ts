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
    shouldStart,
    propertyPrefix = "--lg-press",
    grow,
    release,
  }: ElasticOptions = {},
) {
  const [element, setElement] = useState<T | null>(null);
  useEffect(
    () =>
      element && enabled
        ? press(element, shouldStart, propertyPrefix, { grow, release })
        : undefined,
    [element, enabled, shouldStart, propertyPrefix, grow, release],
  );
  return useCallback(
    (node: T | null) => {
      setElement(node);
      return assignRef(ref, node);
    },
    [ref],
  );
}
