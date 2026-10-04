import Link from "next/link";
import type { CSSProperties } from "react";
import * as stylex from "@stylexjs/stylex";
import { getExample, type Locale } from "@/lib/source";
import { styles } from "@/styles/docs.stylex";
import liveManifest from "@/demos/live-manifest.json";
import { LivePreview } from "./demo/live-preview";
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
  name,
  locale,
  align,
  minHeight,
  isBgSolid,
}: {
  name: string;
  locale: Locale;
  align: "center" | "start" | "end";
  minHeight: string;
  isBgSolid: boolean;
}) {
  return (
    <div
      data-example-scene
      {...stylex.props(
        styles.previewBody,
        align === "start" && codeStyles.start,
        align === "end" && codeStyles.end,
        isBgSolid && codeStyles.solid,
      )}
    >
      <div {...stylex.props(codeStyles.innerScene(minHeight))}>
        <LivePreview name={name} locale={locale} />
      </div>
    </div>
  );
}

export async function ComponentPreview({
  name,
  locale = "en",
  align = "center",
  minHeight = "0px",
  isBgSolid = false,
  hideCode = false,
  description,
  style,
}: {
  name: string;
  locale?: Locale;
  align?: "center" | "start" | "end";
  minHeight?: string;
  isBgSolid?: boolean;
  hideCode?: boolean;
  description?: string;
  style?: Pick<CSSProperties, "contain">;
}) {
  const example = await getExample(name, locale);
  const resolved = resolveDemo(live, name, locale);
  const liveFile = resolved?.file;
  const files = liveFile && !hideCode ? await exampleSourceFiles(liveFile) : undefined;
  const code = files?.[0]?.code ?? example?.code;
  const highlighted = code && !hideCode && !liveFile ? await highlightSource(code) : undefined;
  return (
    <section
      data-example-name={name}
      aria-label={`Example: ${name}`}
      {...stylex.props(styles.preview, codeStyles.containment(style?.contain ?? "content"))}
    >
      {description && <p {...stylex.props(styles.sourceNotice)}>{description}</p>}
      <LocaleNotice status={resolved?.status} />
      {resolved ? (
        <PreviewScene
          name={name}
          locale={resolved.locale}
          align={align}
          minHeight={minHeight}
          isBgSolid={isBgSolid}
        />
      ) : (
        <SourceNotice name={name} example={example} />
      )}
      {code && !hideCode && (
        <ComponentSource code={code} local={!!liveFile} highlighted={highlighted} files={files} />
      )}
    </section>
  );
}
