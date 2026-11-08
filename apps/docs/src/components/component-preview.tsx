import type { ComponentType, CSSProperties, ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { source, type Locale } from "@/lib/source";
import { styles, codeStyles } from "@lenso/docs/presentation";
import liveManifest from "@/demos/live-manifest.json";
import { DeferredExampleSource, type ExampleSourceFile } from "./deferred-example-source";
import { ClientPreview } from "./client-preview";
import { resolveDemo, type DemoManifest } from "@/lib/demo-locale";
import { ComponentExampleFrame, ScrollableExampleScene } from "./component-example-frame";

const live = liveManifest as DemoManifest;

function LocaleNotice({
  status,
}: {
  status: NonNullable<ReturnType<typeof resolveDemo>>["status"] | undefined;
}) {
  const messages = {
    "local-adaptation": null,
    "english-fallback": "此预览复用英文版适配，不代表中文源示例已完成本地实现。",
    "source-equivalent-reuse": "此预览有意复用英文示例。",
  };
  const message = messages[status ?? "local-adaptation"];
  return message ? <p {...stylex.props(styles.sourceNotice)}>{message}</p> : null;
}

function SourceNotice({
  name,
  example,
}: {
  name: string;
  example: { excludedReason?: string } | null;
}) {
  const message =
    example?.excludedReason ??
    (example
      ? "This local example has no runnable preview."
      : `No local example is registered as ${name}.`);
  return <div {...stylex.props(styles.sourceNotice)}>{message}</div>;
}

function PreviewScene({
  children,
  align,
  minHeight,
  isBgSolid,
  registerMenuBackdrop,
}: {
  children: ReactNode;
  align: "center" | "start" | "end";
  minHeight: string;
  isBgSolid: boolean;
  registerMenuBackdrop: boolean;
}) {
  return (
    <ScrollableExampleScene
      registerMenuBackdrop={registerMenuBackdrop}
      data-example-scene
      {...stylex.props(
        previewScene,
        align === "start" && codeStyles.start,
        align === "end" && codeStyles.end,
        isBgSolid && codeStyles.solid,
      )}
    >
      <div {...stylex.props(codeStyles.innerScene(minHeight), previewInner)}>{children}</div>
    </ScrollableExampleScene>
  );
}

export function ComponentPreview({
  name,
  locale = "en",
  align = "center",
  minHeight = "0px",
  isBgSolid = false,
  hideCode = false,
  defaultView = "preview",
  sourceFile,
  description,
  style,
  Preview,
  loadFiles,
  children,
}: {
  name: string;
  locale?: Locale;
  align?: "center" | "start" | "end";
  minHeight?: string;
  isBgSolid?: boolean;
  hideCode?: boolean;
  defaultView?: "preview" | "source";
  sourceFile?: string;
  description?: string;
  style?: Pick<CSSProperties, "contain">;
  Preview?: ComponentType;
  loadFiles?: () => Promise<ExampleSourceFile[]>;
  children?: ReactNode;
}) {
  const example = source.examples[locale][name] ?? null;
  const resolved = resolveDemo(live, name, locale);
  if (resolved && !Preview && children === undefined)
    throw new Error(
      `Missing page-local live preview "${name}" (${locale}). Regenerate docs documents and inject this page's ComponentPreview override into getMDXComponents.`,
    );

  return (
    <section
      data-example-name={name}
      aria-label={`Example: ${name}`}
      {...stylex.props(
        styles.preview,
        exampleSpacing,
        codeStyles.containment(style?.contain ?? "content"),
      )}
    >
      {description && <p {...stylex.props(styles.sourceNotice)}>{description}</p>}
      <LocaleNotice status={resolved?.status} />
      <ComponentExampleFrame
        defaultView={defaultView}
        name={name}
        locale={locale}
        preview={
          resolved ? (
            <PreviewScene
              align={align}
              minHeight={minHeight}
              isBgSolid={isBgSolid}
              registerMenuBackdrop={name === "menu-default"}
            >
              {/^(?:calendar|range-calendar|date-field|date-picker|date-range-picker|time-field)-/.test(
                name,
              ) ? (
                <ClientPreview>{Preview ? <Preview /> : children}</ClientPreview>
              ) : Preview ? (
                <Preview />
              ) : (
                children
              )}
            </PreviewScene>
          ) : (
            <SourceNotice name={name} example={example ? {} : null} />
          )
        }
        source={
          loadFiles && !hideCode ? (
            <DeferredExampleSource load={loadFiles} locale={locale} initialFile={sourceFile} />
          ) : undefined
        }
      />
    </section>
  );
}

const { previewScene, previewInner, exampleSpacing } = stylex.create({
  exampleSpacing: { marginBlock: 24 },
  previewInner: { justifyContent: "safe center" },
  previewScene: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 128,
    padding: { default: 24, "@media (max-width: 639px)": 16 },
    overflow: "auto",
    minWidth: 0,
    borderRadius: "var(--lenso-shape-content-2xl)",
    backgroundColor: "var(--lenso-background-grouped-primary)",
    outline: { default: "none", ":focus-visible": "2px solid var(--lenso-focus-ring)" },
    outlineOffset: -2,
  },
});
