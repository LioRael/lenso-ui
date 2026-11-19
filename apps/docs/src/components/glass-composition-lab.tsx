"use client";

import { useEffect, useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { glassLab as s } from "@/styles/glass-lab.stylex";

export function GlassCompositionLab({ locale, dark }: { locale: "en" | "cn"; dark: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "mounted" | "error">("loading");
  useEffect(() => {
    let canceled = false;
    let dispose: (() => void) | undefined;
    // Keep the research renderer out of the default component demo and its SSR lifecycle.
    import("../lib/glass-composition-scene")
      .then(({ mountCeilingScene }) => {
        if (!canceled && host.current) {
          dispose = mountCeilingScene(host.current, locale, dark, "direct");
          setStatus("mounted");
        }
      })
      .catch(() => {
        if (!canceled) setStatus("error");
      });
    return () => {
      canceled = true;
      dispose?.();
    };
  }, [locale, dark]);
  return (
    <section aria-label={locale === "cn" ? "叠层管线演示" : "Layered pipeline demo"}>
      <div ref={host} />
      {status !== "mounted" ? (
        <p role={status === "error" ? "alert" : "status"} {...stylex.props(s.note)}>
          {status === "loading"
            ? locale === "cn"
              ? "正在加载叠层实验…"
              : "Loading the composition experiment…"
            : locale === "cn"
              ? "实验模块未能加载。可刷新页面重试，或切回原有组件演示。"
              : "The experiment could not load. Reload to retry, or return to the component demo."}
        </p>
      ) : null}
      <p {...stylex.props(s.note)}>
        {locale === "cn"
          ? "此演示使用 paint 缓存、局部模糊与直接消费打包中间结果的完整精度管线。循环边界候选优化未启用；目前的数据不足以宣称整体比原有组件更快。"
          : "This demo uses paint caching, local blur and direct consumption of packed intermediates at full precision. Candidate loop-bound optimizations remain disabled; current data does not establish an overall speedup over the existing components."}
      </p>
    </section>
  );
}
