import { headingText as documentHeadingText } from "@lenso/docs/source";

type Node = {
  type: string;
  depth?: number;
  value?: string;
  children?: Node[];
  name?: string;
  attributes?: { type: string; name: string; value: string }[];
  position?: { start: { offset?: number }; end: { offset?: number } };
};

export function nativeApiFamily(slug: string): string | undefined {
  const match = /^react\/components\/([^/]+)$/.exec(slug);
  const family = match?.[1];
  return family === "text-area" ? "textarea" : family === "text-field" ? "textfield" : family;
}

export function headingText(node: Node): string {
  return documentHeadingText(node);
}

function apiSections(tree: Node) {
  const children = tree.children ?? [];
  const sections: { start: number; end: number }[] = [];
  for (let index = 0; index < children.length; index++) {
    const node = children[index];
    if (node?.type !== "heading" || !/^(?:API Reference|API 参考)$/i.test(headingText(node).trim()))
      continue;
    let end = index + 1;
    while (end < children.length) {
      const following = children[end];
      if (following?.type === "heading" && (following.depth ?? 6) <= (node.depth ?? 2)) break;
      end++;
    }
    sections.push({ start: index, end });
    index = end - 1;
  }
  return sections;
}

// Visible content and clipboard Markdown share parsed section boundaries.
// Fences, JSX examples and nested headings cannot delimit the API section.
export function replaceNativeApiSection(tree: Node, family: string, locale: "en" | "zh") {
  const children = tree.children ?? [];
  const replacement: Node = {
    type: "mdxJsxFlowElement",
    name: "NativeApiReference",
    attributes: [
      { type: "mdxJsxAttribute", name: "family", value: family },
      { type: "mdxJsxAttribute", name: "locale", value: locale },
    ],
    children: [],
  };
  const sections = apiSections(tree);
  for (let index = sections.length - 1; index >= 0; index--) {
    const section = sections[index];
    if (section)
      children.splice(
        section.start,
        section.end - section.start,
        ...(index === 0 ? [replacement] : []),
      );
  }
  if (!sections.length) children.push(replacement);
}

export function projectNativeApiMarkdown(source: string, tree: Node, apiMarkdown: string): string {
  const children = tree.children ?? [];
  const sections = apiSections(tree);
  if (!sections.length) return `${source.trimEnd()}\n\n${apiMarkdown}\n`;
  let result = source;
  for (let index = sections.length - 1; index >= 0; index--) {
    const section = sections[index];
    if (!section) continue;
    const start = children[section.start]?.position?.start.offset;
    const end =
      section.end === children.length
        ? source.length
        : children[section.end]?.position?.start.offset;
    if (start === undefined || end === undefined)
      throw new Error("API Markdown projection requires parsed source positions.");
    result = result.slice(0, start) + (index === 0 ? `${apiMarkdown}\n\n` : "") + result.slice(end);
  }
  return result;
}

type ApiReference = {
  properties: {
    name: string;
    expandedType: string;
    required: boolean;
    default: string | null;
    description: string;
    source: { path: string; line: number };
  }[];
  families: Record<
    string,
    {
      parts: {
        name: string;
        signature: string;
        members: string[];
        native: string[];
        source: { path: string; line: number };
        properties: number[];
        states: Partial<Record<string, { name: string; type: string; required: boolean }[]>>;
      }[];
    }
  >;
};

export function nativeApiMarkdown(
  reference: ApiReference,
  family: string,
  locale: "en" | "zh",
): string {
  const contract = reference.families[family];
  if (!contract) throw new Error(`No generated native API for "${family}".`);
  const zh = locale === "zh";
  const cell = (value: string) =>
    value.replaceAll("\\", "\\\\").replaceAll("|", "\\|").replace(/\r?\n/g, " ");
  const code = (value: string) => {
    const delimiter = "`".repeat(
      Math.max(0, ...(value.match(/`+/g) ?? []).map((run) => run.length)) + 1,
    );
    return `${delimiter} ${value} ${delimiter}`;
  };
  const lines = [
    zh ? "## API 参考" : "## API Reference",
    "",
    zh
      ? "根据本地 @lenso/ui 公开 TypeScript 导出生成。"
      : "Generated from local @lenso/ui public TypeScript exports.",
    "",
    zh
      ? "仅显示组件参数声明中的字面量默认值。其他默认值可能取决于上下文或原生组件。"
      : "Only literal defaults in component parameter declarations are shown. Other defaults may depend on context or the native component.",
  ];
  for (const part of contract.parts) {
    lines.push(
      "",
      `### ${code(part.name)}`,
      "",
      "```tsx",
      part.signature,
      "```",
      "",
      `${part.source.path}:${part.source.line}`,
    );
    if (part.members.length)
      lines.push("", part.members.map((member) => code(`${part.name}.${member}`)).join(", "));
    if (part.native.length) lines.push("", part.native.map(code).join(", "));
    lines.push(
      "",
      zh
        ? "| 属性 | 类型 | 必填 | 本地默认值 | 说明 | 声明来源 |"
        : "| Property | Type | Required | Local default | Description | Declaration |",
      "| --- | --- | --- | --- | --- | --- |",
    );
    for (const id of part.properties) {
      const row = reference.properties[id];
      if (!row) throw new Error(`Missing generated property ${id}.`);
      lines.push(
        `| ${[code(row.name), code(row.expandedType), row.required ? (zh ? "是" : "Yes") : zh ? "否" : "No", row.default === null ? (zh ? "未声明" : "Not declared") : code(row.default), row.description ? code(row.description) : "", `${row.source.path}:${row.source.line}`].map(cell).join(" | ")} |`,
      );
    }
    for (const [name, fields] of Object.entries(part.states)) {
      lines.push("", `#### ${zh ? "回调状态" : "Callback state"}: ${code(name)}`, "");
      for (const field of fields ?? [])
        lines.push(`- ${code(field.name + (field.required ? "" : "?"))}: ${code(field.type)}`);
    }
  }
  return lines.join("\n");
}
