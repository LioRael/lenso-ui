import { isValidElement, type ComponentProps, type ReactNode } from "react";
import { ComponentSource } from "@/components/component-source";

function rawText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(rawText).join("");
  if (isValidElement<{ children?: ReactNode }>(children)) return rawText(children.props.children);
  return "";
}

export function MDXCodeBlock({ children }: ComponentProps<"pre">) {
  const code = rawText(children);
  return (
    <ComponentSource
      code={code}
      local={false}
      standalone
      highlighted={
        isValidElement<{ children?: ReactNode }>(children) ? children.props.children : children
      }
    />
  );
}
