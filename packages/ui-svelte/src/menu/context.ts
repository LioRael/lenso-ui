import { createOptionalContext } from "../context.js";
export const [getMenuSource, setMenuSource] = createOptionalContext<{
  current: HTMLElement | null;
}>();
export function useMenuSourceRef() {
  const source = getMenuSource();
  return (node: HTMLElement) => {
    if (source) source.current = node;
    return () => {
      if (source?.current === node) source.current = null;
    };
  };
}
