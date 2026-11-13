"use client";

import { useState } from "react";
import { Check, ChevronDown, Copy } from "@gravity-ui/icons";
import { Button } from "@lenso/ui/button";
import { ButtonGroup } from "@lenso/ui/button-group";
import { Menu } from "@lenso/ui/menu";
import * as stylex from "@stylexjs/stylex";
import { notebook } from "@lenso/docs/presentation";

export type DocumentationPageActionsProps = { locale?: string } & (
  | { markdown: string; markdownUrl: string }
  | { loadMarkdown: () => Promise<string>; sourceUrl: string }
);

export function DocumentationPageActions({
  locale = "en",
  ...source
}: DocumentationPageActionsProps) {
  const cn = locale === "cn" || locale.startsWith("zh");
  const copyLabel = cn ? "复制 Markdown" : "Copy Markdown";
  const copiedLabel = cn ? "已复制 Markdown" : "Markdown copied";
  const sourceLabel = cn ? "查看页面源码" : "View page source";
  const sourceUrl = "sourceUrl" in source ? source.sourceUrl : source.markdownUrl;
  const [status, setStatus] = useState("");
  const copy = async () => {
    try {
      // Start the write during the click; Safari accepts the pending Blob.
      const markdown =
        "loadMarkdown" in source ? source.loadMarkdown() : Promise.resolve(source.markdown);
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": markdown.then((text) => new Blob([text], { type: "text/plain" })),
        }),
      ]);
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
      <Menu.Root morphTrigger={false}>
        <ButtonGroup aria-label={cn ? "页面操作" : "Page actions"} variant="bordered">
          <Button aria-label={copyLabel} onClick={copy}>
            {status === copiedLabel ? (
              <Check width={16} height={16} aria-hidden="true" />
            ) : (
              <Copy width={16} height={16} aria-hidden="true" />
            )}
            <span {...stylex.props(notebook.pageActionLabel)}>{copyLabel}</span>
          </Button>
          <Menu.Trigger
            render={<Button isIconOnly variant="bordered" />}
            aria-label={cn ? "页面源码选项" : "Page source options"}
          >
            <ButtonGroup.Separator />
            <ChevronDown width={14} height={14} aria-hidden="true" />
          </Menu.Trigger>
        </ButtonGroup>
        <Menu.Content
          sideOffset={8}
          align="end"
          aria-label={cn ? "页面源码选项" : "Page source options"}
        >
          <Menu.Item onSelect={copy}>{copyLabel}</Menu.Item>
          <Menu.Item render={<a href={sourceUrl} aria-label={sourceLabel} />}>
            {sourceLabel}
          </Menu.Item>
        </Menu.Content>
      </Menu.Root>
      <output aria-live="polite" {...stylex.props(notebook.hidden)}>
        {status}
      </output>
    </>
  );
}
