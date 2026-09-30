"use client";

import { useState } from "react";
import { Check, ChevronDown, Copy } from "@gravity-ui/icons";
import { Button, Dropdown } from "@lenso/ui";
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
        <Dropdown.Root>
          <Dropdown.Trigger aria-label="Page source options" xstyle={notebook.pageActionMenu}>
            <ChevronDown width={14} height={14} aria-hidden="true" />
          </Dropdown.Trigger>
          <Dropdown.Portal>
            <Dropdown.Positioner sideOffset={8} align="end">
              <Dropdown.Popup xstyle={notebook.menu}>
                <Dropdown.Item onClick={copy} xstyle={notebook.menuItem}>
                  Copy Markdown
                </Dropdown.Item>
                <Dropdown.LinkItem href={sourceUrl} xstyle={notebook.menuItem}>
                  View pinned upstream page
                </Dropdown.LinkItem>
              </Dropdown.Popup>
            </Dropdown.Positioner>
          </Dropdown.Portal>
        </Dropdown.Root>
      </div>
      <output {...stylex.props(notebook.hidden)}>{status}</output>
    </>
  );
}
