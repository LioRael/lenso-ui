import type { ReactNode } from "react";

interface LivePlaygroundProps {
  controls: ReactNode;
  description: string;
  preview: ReactNode;
  title?: string;
}

export function LivePlayground({
  controls,
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
      </div>
      <div className="playground-body">
        <article className="rendered-stage mdx-rendered-stage">
          <div className="stage-header">
            <h3>Rendered component</h3>
            <span>BOUND TO REAL INSTANCE</span>
          </div>
          {preview}
        </article>
        <aside aria-label="Playground controls" className="playground-inspector dialkit-inspector">
          {controls}
        </aside>
      </div>
    </section>
  );
}
