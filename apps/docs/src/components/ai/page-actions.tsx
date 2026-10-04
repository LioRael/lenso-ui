"use client";

import { useState } from "react";
import { Check, ChevronDown, Copy } from "@gravity-ui/icons";
import { Button, Menu } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { notebook } from "@/styles/notebook.stylex";

export function ViewOptions({ markdown, sourceUrl }: { markdown: string; sourceUrl: string }) {
  const [status, setStatus] = useState("");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setStatus("Markdown copied");
    } catch {
      setStatus("Clipboard unavailable. Select the page text to copy it.");
    }
  };
  return (
    <>
      <div {...stylex.props(notebook.pageActionGroup)}>
        <Button
          variant="ghost"
          xstyle={[notebook.pageAction, notebook.pageActionMain]}
          onClick={copy}
        >
          {status === "Markdown copied" ? (
            <Check width={16} height={16} aria-hidden="true" />
          ) : (
            <Copy width={16} height={16} aria-hidden="true" />
          )}
          Copy Markdown
        </Button>
        <Menu.Root>
          <Menu.Trigger aria-label="Page source options" xstyle={notebook.pageActionMenu}>
            <ChevronDown width={14} height={14} aria-hidden="true" />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner sideOffset={8} align="end">
              <Menu.Popup xstyle={notebook.menu}>
                <Menu.Item onClick={copy} xstyle={notebook.menuItem}>
                  Copy Markdown
                </Menu.Item>
                <Menu.LinkItem href={sourceUrl} xstyle={notebook.menuItem}>
                  View page source
                </Menu.LinkItem>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>
      <output {...stylex.props(notebook.hidden)}>{status}</output>
    </>
  );
}
