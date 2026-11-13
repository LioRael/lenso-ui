import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, Input, TextArea, ThemeScope } from "@lenso/ui";
import "../src/styles/global.css";

function Example({ theme }: { theme: "light" | "dark" }) {
  const input = useRef<HTMLInputElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [large, setLarge] = useState(false);
  const [glass, setGlass] = useState(true);
  const [readOnly, setReadOnly] = useState(false);
  const [submitted, setSubmitted] = useState("");
  const shape = {
    width: large ? 270 : 220,
    maxWidth: "none",
    borderRadius: large ? 14 : 26,
    transition: "width 240ms linear, height 240ms linear, border-radius 240ms linear",
  };
  return (
    <ThemeScope theme={theme}>
      <main style={{ padding: 30 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Button onClick={() => setLarge(!large)}>Change shape</Button>
          <Button onClick={() => setGlass(!glass)}>Toggle glass</Button>
          <Button onClick={() => setReadOnly(!readOnly)}>Toggle read only</Button>
          <Button onClick={() => input.current?.focus()}>Focus input</Button>
          <Button onClick={() => textarea.current?.focus()}>Focus editor</Button>
        </div>
        <div
          data-editor-scroll
          style={{
            position: "relative",
            overflow: "auto",
            height: 340,
            marginTop: 20,
            border: "3px solid gray",
            transform: "scale(.9)",
            transformOrigin: "top left",
          }}
        >
          <form
            style={{ display: "grid", gap: 20, justifyItems: "start", padding: 25, minHeight: 650 }}
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              setSubmitted(JSON.stringify(Object.fromEntries(data)));
            }}
          >
            <label htmlFor="contour-input">Native input</label>
            <Input
              id="contour-input"
              ref={input}
              name="title"
              glass={glass}
              readOnly={readOnly}
              defaultValue="alpha beta gamma"
              style={{ ...shape, height: large ? 64 : 52 }}
            />
            <label htmlFor="contour-textarea">Native editor</label>
            <TextArea
              id="contour-textarea"
              ref={textarea}
              name="body"
              glass={glass}
              readOnly={readOnly}
              defaultValue={"first line\nsecond line\nthird line"}
              style={{ ...shape, height: large ? 190 : 140 }}
            />
            <Button type="submit">Submit values</Button>
          </form>
        </div>
        <output aria-label="Submitted values">{submitted}</output>
      </main>
    </ThemeScope>
  );
}

export function mount(host: HTMLElement, theme: "light" | "dark") {
  const root = createRoot(host);
  root.render(<Example theme={theme} />);
  return () => root.unmount();
}
