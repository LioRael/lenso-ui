import { bindTabsOverflow, type OverflowTab } from "@lenso/glass/motion";
import { useLayoutEffect, useState, type RefObject } from "react";

export function useTabsOverflow(host: RefObject<HTMLDivElement | null>, enabled: boolean) {
  const [overflow, setOverflow] = useState<OverflowTab[]>([]);
  useLayoutEffect(() => {
    const container = host.current;
    if (container && enabled) return bindTabsOverflow(container, setOverflow);
  }, [host, enabled]);
  return enabled ? overflow : [];
}
