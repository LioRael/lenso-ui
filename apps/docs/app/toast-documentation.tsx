"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { ThemeScope } from "@lenso/ui/theme-scope";
import { Toast, type ToastTone } from "@lenso/ui/toast";
import { DocsShell } from "./docs-shell";
import { useDocsPageTheme } from "./use-docs-page-theme";

const codeExample = `import { Toast } from "@lenso/ui/toast"

<Toast.Provider>
  <App />
  <Toast.Portal>
    <Toast.Viewport><Toast.List /></Toast.Viewport>
  </Toast.Portal>
</Toast.Provider>`;

function ToastPlayground({ tone }: { tone: ToastTone }) {
  const { add, close } = Toast.useToastManager();
  React.useEffect(() => {
    const id = add({ description: "“TES-11” copied to clipboard", timeout: 0, type: tone });
    return () => close(id);
  }, [add, close, tone]);
  return (
    <>
      <Button
        onClick={() => add({ description: "“TES-11” copied to clipboard", type: tone })}
        variant="secondary"
      >
        Show toast
      </Button>
      <Toast.Portal>
        <Toast.Viewport>
          <Toast.List />
        </Toast.Viewport>
      </Toast.Portal>
    </>
  );
}

export function ToastDocumentation() {
  const pageTheme = useDocsPageTheme();
  const [tone, setTone] = React.useState<ToastTone>("default");
  return (
    <DocsShell
      actions={["View source", "Install"]}
      breadcrumbs={["Components", "Toast"]}
      current="toast"
      theme={pageTheme}
    >
      <div className="button-docs-content">
        <section className="button-overview">
          <p className="button-eyebrow">FOUNDATION COMPONENT · FEEDBACK</p>
          <h1>Toast</h1>
          <p className="button-description">
            Brief, non-blocking feedback with accessible announcements, timed dismissal, and swipe
            gestures.
          </p>
          <div className="metadata-pills button-metadata">
            <span>Figma canonical</span>
            <span>Base UI behavior</span>
          </div>
        </section>
        <section className="button-playground">
          <div className="playground-heading">
            <div>
              <h2>Live playground</h2>
              <p>Change the semantic tone and trigger the real notification.</p>
            </div>
          </div>
          <div className="playground-body">
            <article className="rendered-stage">
              <div className="stage-header">
                <h3>Rendered component</h3>
                <span>BOUND TO REAL INSTANCE</span>
              </div>
              <ThemeScope className="stage-canvas" theme={pageTheme}>
                <Toast.Provider timeout={5000}>
                  <ToastPlayground tone={tone} />
                </Toast.Provider>
              </ThemeScope>
            </article>
            <aside className="playground-inspector">
              <div className="inspector-header">
                <strong>Toast</strong>
                <button type="button">Example · Clipboard</button>
              </div>
              <div className="inspector-divider" />
              <label className="inspector-row">
                <span>Tone</span>
                <select onChange={(event) => setTone(event.target.value as ToastTone)} value={tone}>
                  <option value="default">Default</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                </select>
              </label>
            </aside>
          </div>
        </section>
        <section className="button-guidance select-guidance">
          <article>
            <h2>Usage guidance</h2>
            <ul>
              <li>Use to confirm background actions without interrupting work.</li>
              <li>Keep the message to one compact line whenever possible.</li>
            </ul>
          </article>
          <article>
            <h2>Accessibility</h2>
            <ul>
              <li>
                Base UI announces low- and high-priority messages through the appropriate live
                region.
              </li>
              <li>Close remains keyboard accessible; swipe dismissal is an additional gesture.</li>
            </ul>
          </article>
        </section>
        <section className="button-implementation select-implementation">
          <div>
            <h2>Implementation</h2>
            <p>Composable toast parts with a convenient default list renderer.</p>
          </div>
          <pre>
            <code>{codeExample}</code>
          </pre>
        </section>
      </div>
    </DocsShell>
  );
}
