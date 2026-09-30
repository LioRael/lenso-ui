"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UseOverlayStateProps {
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}
export interface UseOverlayStateReturn {
  readonly isOpen: boolean;
  setOpen(isOpen: boolean): void;
  open(): void;
  close(): void;
  toggle(): void;
}

/** Adapted from HeroUI v3.2.6 (Apache-2.0). */
export function useOverlayState(props: UseOverlayStateProps = {}): UseOverlayStateReturn {
  const { isOpen: controlled, defaultOpen = false, onOpenChange } = props;
  const [internal, setInternal] = useState(defaultOpen);
  const isControlled = controlled !== undefined;
  const isOpen = controlled ?? internal;
  const callback = useRef(onOpenChange);
  useEffect(() => {
    callback.current = onOpenChange;
  }, [onOpenChange]);
  const setOpen = useCallback(
    (next: boolean) => {
      callback.current?.(next);
      if (!isControlled) setInternal(next);
    },
    [isControlled],
  );
  const open = useCallback(() => setOpen(true), [setOpen]);
  const close = useCallback(() => setOpen(false), [setOpen]);
  const toggle = useCallback(() => setOpen(!isOpen), [setOpen, isOpen]);
  return { isOpen, setOpen, open, close, toggle };
}
