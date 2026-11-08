import { useState } from "react";
import { createRoot } from "react-dom/client";
import { ThemeScope } from "@lenso/ui";
import { Default } from "../src/demos/cn/menu/default";
import { PhotosViewerMenu } from "../src/components/photos-viewer-menu";
import "../src/styles/global.css";
function Fixture() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(0);
  return (
    <ThemeScope theme="light">
      <main style={{ padding: 40, minHeight: 900 }}>
        <section data-action-case="default">
          <Default />
        </section>
        <section data-action-case="photos" style={{ marginTop: 140 }}>
          <PhotosViewerMenu
            open={open}
            onOpenChange={setOpen}
            onCopy={() => setCopied((n) => n + 1)}
            onDuplicate={() => {}}
            onHide={() => {}}
            onSlideshow={() => {}}
            onAlbum={() => {}}
            onInformation={() => {}}
          />
          <output data-copied="">{copied}</output>
        </section>
      </main>
    </ThemeScope>
  );
}
export function mount(host: HTMLElement) {
  const root = createRoot(host);
  root.render(<Fixture />);
  return () => root.unmount();
}
