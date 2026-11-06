"use client";
/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The overflow viewport must support keyboard scrolling. */
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { paintMaterialBackdrop } from "@lenso/glass";
import { useGlassRef } from "@lenso/glass/react";
import {
  materialStyles,
  liquidMaterialStyles,
  vibrantStyles,
  type MaterialVariant,
} from "@lenso/tokens/materials";
import { Button } from "@lenso/ui/button";
import * as stylex from "@stylexjs/stylex";
const s = stylex.create({
  gallery: { display: "grid", gap: 24, width: "100%", minWidth: 0 },
  scene: {
    position: "relative",
    padding: 24,
    borderRadius: 20,
    overflow: "hidden",
    display: "grid",
    gap: 20,
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      "@media(max-width:600px)": "minmax(0, 1fr)",
    },
  },
  backdrop: {
    position: "absolute",
    inset: 0,
    backgroundImage: "linear-gradient(120deg, #0088ff, #b786d9 45%, #ffba71)",
    backgroundSize: "100% 100%",
  },
  darkBackdrop: { backgroundImage: "linear-gradient(120deg, #103c68, #58436d 45%, #93502b)" },
  tile: { padding: 20, borderRadius: 22, minHeight: 100, minWidth: 0 },
  label: { fontSize: 15, fontWeight: 600, margin: 0 },
  caption: { fontSize: 13, marginTop: 8, marginBottom: 0 },
  controls: { display: "flex", gap: 8, flexWrap: "wrap" },
  edgeGrid: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      "@media (max-width: 639px)": "minmax(0, 1fr)",
    },
    gap: 24,
  },
  edgeScene: {
    position: "relative",
    height: 260,
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "var(--lenso-background-grouped-primary)",
  },
  edgeTitle: { fontSize: 14, fontWeight: 600, marginTop: 0, marginBottom: 12 },
  edgeRow: {
    margin: 0,
    paddingBlock: 16,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "var(--lenso-separator)",
    fontSize: 14,
  },
  edgeNote: { margin: 0, fontSize: 13, lineHeight: 1.6 },
  scroll: {
    height: "100%",
    overflowY: "auto",
    paddingInline: 20,
    overscrollBehavior: "contain",
    outlineOffset: -3,
  },
  edge: { height: 64 },
  swatch: { width: 28, height: 28, borderRadius: 8 },
  row: { display: "flex", gap: 10, alignItems: "center", marginTop: 8 },
});
const blurVariants = ["ultrathin", "thin", "regular", "thick", "chrome"] as const;
const glassVariants = ["glass-small", "glass-medium", "glass-large", "glass-clear"] as const;
function SampleMaterial({ variant, children }: { variant: MaterialVariant; children: ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const liquid =
    variant === "glass-small" ||
    variant === "glass-medium" ||
    variant === "glass-large" ||
    variant === "glass-clear";
  const lens = useGlassRef<HTMLSpanElement>(undefined, liquid, false, variant);
  useEffect(() => {
    if (!liquid && host.current) return paintMaterialBackdrop(host.current);
  }, [liquid, variant]);
  return (
    <div
      ref={host}
      data-material={variant}
      {...stylex.props(
        materialStyles.root,
        !liquid && materialStyles[variant],
        materialStyles.accessible,
        s.tile,
      )}
    >
      {liquid ? (
        <span
          ref={lens}
          aria-hidden="true"
          data-material-lens=""
          {...stylex.props(
            materialStyles.layer,
            liquidMaterialStyles.small,
            (variant === "glass-medium" || variant === "glass-large") &&
              liquidMaterialStyles.medium,
            variant === "glass-large" && liquidMaterialStyles.large,
            variant === "glass-clear" && liquidMaterialStyles.clear,
          )}
        />
      ) : (
        <>
          <span
            aria-hidden="true"
            {...stylex.props(materialStyles.layer, materialStyles.fallback, materialStyles.blur)}
          />
          <span
            aria-hidden="true"
            {...stylex.props(materialStyles.layer, materialStyles.fallback, materialStyles.lower)}
          />
          <span
            aria-hidden="true"
            {...stylex.props(materialStyles.layer, materialStyles.fallback, materialStyles.upper)}
          />
        </>
      )}
      {children}
    </div>
  );
}
function SampleEdge({
  variant,
  edge,
  scrollRef,
}: {
  variant: "soft" | "hard";
  edge: "top" | "bottom";
  scrollRef: RefObject<HTMLElement | null>;
}) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const viewport = scrollRef.current;
    if (!viewport) return;
    const update = () =>
      setActive(
        edge === "top"
          ? viewport.scrollTop > 0
          : viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight - 1,
      );
    update();
    viewport.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    return () => {
      viewport.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [edge, scrollRef]);
  const mask = `linear-gradient(${edge === "top" ? "to bottom" : "to top"},black,transparent)`;
  return (
    <span
      aria-hidden="true"
      data-scroll-bound=""
      data-scroll-active={active || undefined}
      {...stylex.props(
        materialStyles.edge,
        materialStyles[edge],
        variant === "soft" && materialStyles.soft,
        s.edge,
      )}
    >
      {variant === "soft" && (
        <span
          {...stylex.props(materialStyles.softLayer, materialStyles.softProgressive(8, mask))}
        />
      )}
    </span>
  );
}

export function MaterialsPreview({ chinese = false }: { chinese?: boolean }) {
  const [family, setFamily] = useState<"blur" | "glass">("blur");
  const variants: readonly MaterialVariant[] = family === "blur" ? blurVariants : glassVariants;
  return (
    <div {...stylex.props(s.gallery)}>
      <div {...stylex.props(s.controls)} aria-label={chinese ? "材料类型" : "Material family"}>
        <Button aria-pressed={family === "blur"} onClick={() => setFamily("blur")}>
          {chinese ? "模糊材料" : "Blur materials"}
        </Button>
        <Button aria-pressed={family === "glass"} onClick={() => setFamily("glass")}>
          Liquid Glass
        </Button>
      </div>
      {(["light", "dark"] as const).map((theme) => (
        <div
          key={theme}
          data-theme={theme}
          data-testid={`materials-${theme}`}
          {...stylex.props(s.scene)}
        >
          <div
            data-lenso-backdrop
            {...stylex.props(s.backdrop, theme === "dark" && s.darkBackdrop)}
          />
          {variants.map((variant) => (
            <SampleMaterial key={variant} variant={variant}>
              <p {...stylex.props(s.label)}>{variant}</p>
              <div {...stylex.props(s.row)}>
                <span
                  aria-hidden="true"
                  {...stylex.props(vibrantStyles.fill, vibrantStyles.primaryFill, s.swatch)}
                />
                <span {...stylex.props(s.caption)}>
                  {chinese ? "次要内容" : "Secondary content"}
                </span>
              </div>
              <p {...stylex.props(s.caption)}>
                {theme === "dark"
                  ? chinese
                    ? "深色材料"
                    : "Dark material"
                  : chinese
                    ? "浅色材料"
                    : "Light material"}
              </p>
            </SampleMaterial>
          ))}
        </div>
      ))}
      <ScrollEdgesPreview chinese={chinese} />
    </div>
  );
}

function ScrollEdgesPreview({ chinese }: { chinese: boolean }) {
  const [short, setShort] = useState(false);
  return (
    <>
      <div {...stylex.props(s.controls)}>
        <Button aria-pressed={!short} onClick={() => setShort(false)}>
          {chinese ? "长内容" : "Long content"}
        </Button>
        <Button aria-pressed={short} onClick={() => setShort(true)}>
          {chinese ? "短内容" : "Short content"}
        </Button>
      </div>
      <p {...stylex.props(s.edgeNote)}>
        {chinese
          ? "滚动内容在视口外还有延续时，对应边缘才会出现；到达起点或终点时淡出。"
          : "Edges appear where content continues beyond the viewport, and fade away at the start or end."}
      </p>
      <div {...stylex.props(s.edgeGrid)}>
        <EdgePreview variant="soft" chinese={chinese} short={short} />
        <EdgePreview variant="hard" chinese={chinese} short={short} />
      </div>
    </>
  );
}
function EdgePreview({
  variant,
  chinese,
  short,
}: {
  variant: "soft" | "hard";
  chinese: boolean;
  short: boolean;
}) {
  const scrollRef = useRef<HTMLElement | null>(null);
  return (
    <div data-edge-demo={variant}>
      <p {...stylex.props(s.edgeTitle)}>{variant === "soft" ? "Soft Edge" : "Hard Edge"}</p>
      <div {...stylex.props(s.edgeScene)} data-edge-frame>
        <section
          ref={scrollRef}
          data-edge-scroll
          {...stylex.props(s.scroll)}
          tabIndex={0}
          aria-label={`${variant === "soft" ? "Soft" : "Hard"} ${chinese ? "滚动边缘预览" : "scroll edge preview"}`}
        >
          <div data-edge-content>
            {Array.from({ length: short ? 2 : 16 }, (_, index) => (
              <p key={index} {...stylex.props(s.edgeRow)}>
                {chinese ? "滚动内容" : "Scrolling content"} {String(index + 1).padStart(2, "0")}
              </p>
            ))}
          </div>
        </section>
        <SampleEdge variant={variant} edge="top" scrollRef={scrollRef} />
        <SampleEdge variant={variant} edge="bottom" scrollRef={scrollRef} />
      </div>
    </div>
  );
}
