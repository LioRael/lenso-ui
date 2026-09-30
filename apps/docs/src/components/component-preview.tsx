import Link from "next/link";
import type { CSSProperties } from "react";
import * as stylex from "@stylexjs/stylex";
import { getExample, type Locale } from "@/lib/source";
import { styles } from "@/styles/docs.stylex";
import { notebook } from "@/styles/notebook.stylex";
import liveManifest from "@/demos/live-manifest.json";
import { LivePreview } from "./demo/live-preview";
import { ComponentSource } from "./component-source";
import { highlightSource } from "./highlight-source";
import { exampleSourceFiles } from "./example-source-files";
import { codeStyles } from "@/styles/code.stylex";

const live = liveManifest as Record<string, string>;

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
  align,
  minHeight,
  isBgSolid,
}: {
  name: string;
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
        <LivePreview name={name} />
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
  const liveFile = live[name];
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
      {locale === "cn" && liveFile && (
        <p {...stylex.props(styles.sourceNotice)}>
          此预览复用英文版适配，不代表中文源示例已完成本地实现。
        </p>
      )}
      {liveFile ? (
        <PreviewScene name={name} align={align} minHeight={minHeight} isBgSolid={isBgSolid} />
      ) : (
        <SourceNotice name={name} example={example} />
      )}
      {code && !hideCode && (
        <ComponentSource code={code} local={!!liveFile} highlighted={highlighted} files={files} />
      )}
      {example && (
        <p {...stylex.props(notebook.previewAttribution)}>
          {liveFile
            ? "Local adaptation source above. Derived from "
            : "Preserved source only. Derived from "}
          <a
            href={`https://github.com/heroui-inc/heroui/blob/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/${example.source}`}
            {...stylex.props(styles.proseLink)}
          >
            HeroUI v3.2.6 source
          </a>
          .
        </p>
      )}
    </section>
  );
}
