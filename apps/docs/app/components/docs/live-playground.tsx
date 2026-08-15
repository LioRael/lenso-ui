import type { ReactNode } from "react";

interface LivePlaygroundProps {
  actions?: ReactNode;
  controls: ReactNode;
  controlsMode?: "custom" | "dialkit";
  description: string;
  preview: ReactNode;
  title?: string;
}

export function LivePlayground({
  actions,
  controls,
  controlsMode = "dialkit",
  description,
  preview,
  title = "Live playground",
}: LivePlaygroundProps) {
  return (
    <section className="button-playground mdx-live-playground">
      <div className="playground-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {actions && <div className="playground-actions">{actions}</div>}
      </div>
      <div className="playground-body">
        <article className="rendered-stage mdx-rendered-stage">
          <div className="stage-header">
            <h3>Rendered component</h3>
            <span>BOUND TO REAL INSTANCE</span>
          </div>
          {preview}
        </article>
        <aside
          aria-label="Playground controls"
          className={`playground-inspector${controlsMode === "dialkit" ? " dialkit-inspector" : ""}`}
        >
          {controls}
        </aside>
      </div>
    </section>
  );
}
