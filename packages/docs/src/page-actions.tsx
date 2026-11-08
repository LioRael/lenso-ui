"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@base-ui/react/button";
import { Menu } from "@base-ui/react/menu";
import { Check, ChevronDown, Copy } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { notebook } from "@lenso/docs/presentation";

export function DocumentationPageActions({
  markdown,
  markdownUrl,
  locale = "en",
}: {
  markdown: string;
  markdownUrl: string;
  locale?: string;
}): ReactNode {
  const cn = locale === "cn" || locale.startsWith("zh");
  const copyLabel = cn ? "复制 Markdown" : "Copy Markdown";
  const copiedLabel = cn ? "已复制 Markdown" : "Markdown copied";
  const sourceLabel = cn ? "查看页面源码" : "View page source";
  const [status, setStatus] = useState("");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setStatus(copiedLabel);
    } catch {
      setStatus(
        cn
          ? "无法访问剪贴板，请选择页面文字复制。"
          : "Clipboard unavailable. Select the page text to copy it.",
      );
    }
  };
  return (
    <>
      <div {...stylex.props(notebook.pageActionGroup)}>
        <Button
          aria-label={copyLabel}
          onClick={copy}
          {...stylex.props(notebook.pageAction, notebook.pageActionMain)}
        >
          {status === copiedLabel ? (
            <Check width={16} height={16} aria-hidden="true" />
          ) : (
            <Copy width={16} height={16} aria-hidden="true" />
          )}
          <span {...stylex.props(notebook.pageActionLabel)}>{copyLabel}</span>
        </Button>
        <Menu.Root>
          <Menu.Trigger
            aria-label={cn ? "页面源码选项" : "Page source options"}
            {...stylex.props(notebook.pageActionMenu)}
          >
            <ChevronDown width={14} height={14} aria-hidden="true" />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner sideOffset={8} align="end">
              <Menu.Popup {...stylex.props(notebook.menu)}>
                <Menu.Item onClick={copy} {...stylex.props(notebook.menuItem)}>
                  {copyLabel}
                </Menu.Item>
                <Menu.LinkItem href={markdownUrl} {...stylex.props(notebook.menuItem)}>
                  {sourceLabel}
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
