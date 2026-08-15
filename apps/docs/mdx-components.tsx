import type { MDXComponents } from "mdx/types";

import { Playground } from "./components/docs/playground";

const components: MDXComponents = { Playground };

export function useMDXComponents(): MDXComponents {
  return components;
}
