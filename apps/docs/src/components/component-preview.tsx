import Link from "next/link";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { getExample, type Locale } from "@/lib/source";
import { styles } from "@/styles/docs.stylex";
import liveManifest from "@/demos/live-manifest.json";
import { ComponentExampleFrame, ScrollableExampleScene } from "./component-example-frame";
import { ComponentSource } from "./component-source";
import { highlightSource } from "./highlight-source";
import { exampleSourceFiles } from "./example-source-files";
import { codeStyles } from "@/styles/code.stylex";
import { resolveDemo, type DemoManifest } from "@/lib/demo-locale";

const live = liveManifest as DemoManifest;

function LocaleNotice({
  status,
}: {
  status: NonNullable<ReturnType<typeof resolveDemo>>["status"] | undefined;
}) {
  const messages = {
    "local-adaptation": null,
    "english-fallback": "此预览复用英文版适配，不代表中文源示例已完成本地实现。",
    "source-equivalent-reuse":
      "中英文固定源示例相同或 AST 等价；此预览复用同一适配模块，不计为中文翻译。",
  };
  const message = messages[status ?? "local-adaptation"];
  return message ? <p {...stylex.props(styles.sourceNotice)}>{message}</p> : null;
}

function SourceNotice({
  name,
  example,
}: {
  name: string;
  example: Awaited<ReturnType<typeof getExample>>;
}) {
  const message =
    example?.excludedReason ??
    (example
      ? "Preserved upstream example. Its React Aria interaction or Tailwind styling has not yet been migrated to the local runtime; this is source, not a working Lenso UI preview."
      : `This preview reference (${name}) is missing from the pinned upstream demo registry.`);
  return (
    <div {...stylex.props(styles.sourceNotice)}>
      {message}{" "}
      <Link href="/coverage" {...stylex.props(styles.proseLink)}>
        Migration coverage
      </Link>
    </div>
  );
}

function PreviewScene({
  children,
  align,
  minHeight,
  isBgSolid,
  menuBackdrop,
}: {
  children: ReactNode;
  align: "center" | "start" | "end";
  minHeight: string;
  isBgSolid: boolean;
  menuBackdrop: boolean;
}) {
  return (
    <ScrollableExampleScene
      registerMenuBackdrop={menuBackdrop}
      data-example-scene
      {...stylex.props(
        glassExample.scene,
        align === "start" && codeStyles.start,
        align === "end" && codeStyles.end,
        isBgSolid && codeStyles.solid,
      )}
    >
      <div {...stylex.props(codeStyles.innerScene(minHeight), glassExample.inner)}>{children}</div>
    </ScrollableExampleScene>
  );
}

export async function ComponentPreview({
  name,
  locale = "en",
  align = "center",
  minHeight = "0px",
  isBgSolid = false,
  hideCode = false,
  defaultView = "preview",
  description,
  style,
  Preview,
  children,
}: {
  name: string;
  locale?: Locale;
  align?: "center" | "start" | "end";
  minHeight?: string;
  isBgSolid?: boolean;
  hideCode?: boolean;
  defaultView?: "preview" | "source";
  description?: string;
  style?: Pick<CSSProperties, "contain">;
  Preview?: ComponentType;
  children?: ReactNode;
}) {
  const example = await getExample(name, locale);
  const resolved = resolveDemo(live, name, locale);
  if (resolved && !Preview && children === undefined)
    throw new Error(
      `Missing page-local live preview "${name}" (${locale}). Regenerate docs documents and inject this page's ComponentPreview override into getMDXComponents.`,
    );
  const liveFile = resolved?.file;
  const files = liveFile && !hideCode ? await exampleSourceFiles(liveFile) : undefined;
  const code = files?.[0]?.code ?? example?.code;
  const highlighted = code && !hideCode && !liveFile ? await highlightSource(code) : undefined;
  const preview = resolved ? (
    <PreviewScene
      menuBackdrop={name === "menu-default"}
      align={align}
      minHeight={minHeight}
      isBgSolid={isBgSolid}
    >
      {Preview ? <Preview /> : children}
    </PreviewScene>
  ) : (
    <SourceNotice name={name} example={example} />
  );
  const source = code && !hideCode && (
    <ComponentSource
      code={files?.length ? "" : code}
      live={!!files}
      local={!!liveFile}
      highlighted={highlighted}
      files={files}
      locale={locale}
    />
  );
  return (
    <section
      data-example-name={name}
      aria-label={`Example: ${name}`}
      {...stylex.props(styles.preview, codeStyles.containment(style?.contain ?? "content"))}
    >
      {description && <p {...stylex.props(styles.sourceNotice)}>{description}</p>}
      <LocaleNotice status={resolved?.status} />
      <ComponentExampleFrame
        name={name}
        locale={locale}
        preview={preview}
        source={source}
        defaultView={defaultView}
      />
    </section>
  );
}

const glassExample = stylex.create({
  inner: { justifyContent: "safe center" },
  scene: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 128,
    padding: { default: 24, "@media (max-width: 639px)": 16 },
    overflow: "auto",
    minWidth: 0,
    borderRadius: "var(--lenso-shape-content-2xl, 16px)",
    backgroundColor: "var(--lenso-background-grouped-primary)",
    outline: { default: "none", ":focus-visible": "2px solid var(--lenso-focus-ring)" },
    outlineOffset: -2,
  },
});
