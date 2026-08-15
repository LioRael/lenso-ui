"use client";

import * as React from "react";

import { Button } from "@lenso/ui/button";
import { ThemeScope } from "@lenso/ui/theme-scope";
import { Toast, type ToastTone } from "@lenso/ui/toast";
import { CodeBlock } from "../code-block";
import { ComponentPage } from "../component-page";
import { LivePlayground } from "../live-playground";
import { PlaygroundControls, PlaygroundSelectControl } from "../playground-controls";
import { useDocsPageTheme } from "../use-docs-page-theme";

const codeExample = `import { Toast } from "@lenso/ui/toast"

<Toast.Provider>
  <App />
  <Toast.Portal>
    <Toast.Viewport>
      <Toast.List />
    </Toast.Viewport>
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
    <ComponentPage
      description="Brief, non-blocking feedback with accessible announcements, timed dismissal, and swipe gestures."
      eyebrow="Foundation component · Feedback"
      metadata={["Figma canonical", "Base UI behavior"]}
      name="Toast"
      slug="toast"
    >
      <LivePlayground
        controls={
          <PlaygroundControls
            example="default"
            exampleLabel="Example · Clipboard"
            name="Toast"
            onExampleChange={() => {}}
          >
            <PlaygroundSelectControl
              label="Tone"
              onValueChange={(value) => setTone(value as ToastTone)}
              options={[
                { label: "Default", value: "default" },
                { label: "Success", value: "success" },
                { label: "Error", value: "error" },
              ]}
              value={tone}
            />
          </PlaygroundControls>
        }
        controlsMode="custom"
        description="Change the semantic tone and trigger the real notification."
        preview={
          <ThemeScope className="stage-canvas" theme={pageTheme}>
            <Toast.Provider timeout={5000}>
              <ToastPlayground tone={tone} />
            </Toast.Provider>
          </ThemeScope>
        }
      />
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
              Base UI announces low- and high-priority messages through the appropriate live region.
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
        <CodeBlock code={codeExample} />
      </section>
    </ComponentPage>
  );
}
