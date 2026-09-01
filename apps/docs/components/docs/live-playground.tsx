import type { ReactNode } from "react";

interface LivePlaygroundProps {
  actions?: ReactNode;
  bodyClassName?: string;
  controls: ReactNode;
  preview: ReactNode;
  sectionClassName?: string;
  stageClassName?: string;
  title?: string;
}

export function LivePlayground({
  actions,
  bodyClassName,
  controls,
  preview,
  sectionClassName,
  stageClassName,
  title = "Live playground",
}: LivePlaygroundProps) {
  return (
    <section
      className={`button-playground mdx-live-playground${sectionClassName ? ` ${sectionClassName}` : ""}`}
    >
      <div className="playground-heading">
        <h2>{title}</h2>
        {actions && <div className="playground-actions">{actions}</div>}
      </div>
      <div className={`playground-body${bodyClassName ? ` ${bodyClassName}` : ""}`}>
        <article
          className={`rendered-stage mdx-rendered-stage${stageClassName ? ` ${stageClassName}` : ""}`}
        >
          {preview}
        </article>
        <aside aria-label="Playground controls" className="playground-inspector">
          {controls}
        </aside>
      </div>
    </section>
  );
}
