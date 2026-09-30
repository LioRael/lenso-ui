import { isValidElement, type ComponentProps, type ReactNode } from "react";
import { ComponentSource } from "@/components/component-source";
import { highlightSource } from "@/components/highlight-source";

function rawText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(rawText).join("");
  if (isValidElement<{ children?: ReactNode }>(children)) return rawText(children.props.children);
  return "";
}

export async function MDXCodeBlock({ children }: ComponentProps<"pre">) {
  const code = rawText(children);
  const className = isValidElement<{ className?: string }>(children)
    ? children.props.className
    : "";
  const language = className?.match(/(?:^|\s)language-([^\s]+)/)?.[1] ?? "text";
  return (
    <ComponentSource
      code={code}
      local={false}
      standalone
      highlighted={await highlightSource(code, language)}
    />
  );
}
