"use client";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { ContextMenu } from "@lenso/ui";
const s = stylex.create({
  target: {
    width: 280,
    minHeight: 140,
    padding: 24,
    borderRadius: 24,
    backgroundColor: "var(--lenso-background-secondary)",
    color: "var(--lenso-label-primary)",
    display: "grid",
    alignContent: "center",
    gap: 8,
    cursor: "context-menu",
    userSelect: "none",
  },
  title: { margin: 0, fontSize: 20, fontWeight: 600 },
  detail: { margin: 0, fontSize: 13, lineHeight: "18px", color: "var(--lenso-label-secondary)" },
  preview: { padding: 24, display: "grid", alignContent: "center", gap: 8 },
  root: { display: "grid", gap: 16 },
});
export function ContextMenuStory({
  elastic = true,
  presentation = "popup",
  preview = true,
  layout = "vertical",
  previewAlign = "leading",
  dim = true,
}: {
  elastic?: boolean;
  presentation?: "popup" | "bar";
  preview?: boolean;
  layout?: "vertical" | "horizontal";
  previewAlign?: "leading" | "trailing";
  dim?: boolean;
}) {
  const [action, setAction] = useState(""),
    [favorite, setFavorite] = useState(false);
  return (
    <div {...stylex.props(s.root)}>
      <ContextMenu elastic={elastic} presentation={presentation}>
        <ContextMenu.Trigger aria-label="Project notes" xstyle={s.target}>
          <p {...stylex.props(s.title)}>Project notes</p>
          <p {...stylex.props(s.detail)}>Right-click or long-press for actions.</p>
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          {dim && <ContextMenu.Backdrop />}
          <ContextMenu.Positioner layout={layout} previewAlign={previewAlign}>
            {preview && (
              <ContextMenu.Preview xstyle={s.preview}>
                <p {...stylex.props(s.title)}>Project notes</p>
                <p {...stylex.props(s.detail)}>Design decisions and ideas for the next release.</p>
              </ContextMenu.Preview>
            )}
            <ContextMenu.Popup
              aria-label="Note actions"
              bar={
                <>
                  <ContextMenu.BarItem onClick={() => setAction("Cut")}>Cut</ContextMenu.BarItem>
                  <ContextMenu.BarItem onClick={() => setAction("Copied")}>
                    Copy
                  </ContextMenu.BarItem>
                  <ContextMenu.BarItem onClick={() => setAction("Pasted")}>
                    Paste
                  </ContextMenu.BarItem>
                </>
              }
            >
              <ContextMenu.Item onClick={() => setAction("Opened")}>Open</ContextMenu.Item>
              <ContextMenu.Item onClick={() => setAction("Duplicated")}>Duplicate</ContextMenu.Item>
              <ContextMenu.CheckboxItem checked={favorite} onCheckedChange={setFavorite}>
                Favorite
                <ContextMenu.CheckboxItemIndicator />
              </ContextMenu.CheckboxItem>
              <ContextMenu.SubmenuRoot>
                <ContextMenu.SubmenuTrigger>Move to</ContextMenu.SubmenuTrigger>
                <ContextMenu.Portal>
                  <ContextMenu.Positioner>
                    <ContextMenu.Popup aria-label="Destination">
                      <ContextMenu.Item onClick={() => setAction("Moved to archive")}>
                        Archive
                      </ContextMenu.Item>
                      <ContextMenu.Item onClick={() => setAction("Moved to projects")}>
                        Projects
                      </ContextMenu.Item>
                    </ContextMenu.Popup>
                  </ContextMenu.Positioner>
                </ContextMenu.Portal>
              </ContextMenu.SubmenuRoot>
              <ContextMenu.Separator />
              <ContextMenu.Item variant="danger" onClick={() => setAction("Deleted")}>
                Delete
              </ContextMenu.Item>
            </ContextMenu.Popup>
          </ContextMenu.Positioner>
        </ContextMenu.Portal>
      </ContextMenu>
      <output aria-live="polite">{action}</output>
    </div>
  );
}
