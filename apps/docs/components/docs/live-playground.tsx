import type { ReactNode } from "react";

interface LivePlaygroundProps {
  actions?: ReactNode;
  bodyClassName?: string;
  controls: ReactNode;
  description: string;
  preview: ReactNode;
  sectionClassName?: string;
  stageClassName?: string;
  title?: string;
}

export function LivePlayground({
  actions,
  bodyClassName,
  controls,
  description,
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
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {actions && <div className="playground-actions">{actions}</div>}
      </div>
      <div className={`playground-body${bodyClassName ? ` ${bodyClassName}` : ""}`}>
        <article
          className={`rendered-stage mdx-rendered-stage${stageClassName ? ` ${stageClassName}` : ""}`}
        >
          <div className="stage-header">
            <h3>Rendered component</h3>
          </div>
          {preview}
        </article>
        <aside aria-label="Playground controls" className="playground-inspector">
          {controls}
        </aside>
      </div>
    </section>
  );
}
