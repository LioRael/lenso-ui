"use client";

import { useState } from "react";
import { Check, ChevronDown, Copy } from "@gravity-ui/icons";
import { controlButtonStyles } from "@lenso/tokens/button";
import { Button, ButtonGroup, Menu } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { notebook } from "@lenso/docs/presentation";

export function ViewOptions({
  markdown,
  sourceUrl,
  locale = "en",
}: {
  markdown: string;
  sourceUrl: string;
  locale?: string;
}) {
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
            render={
              <Button
                isIconOnly
                variant="bordered"
                xstyle={controlButtonStyles.groupedHorizontal}
              />
            }
            aria-label={cn ? "页面源码选项" : "Page source options"}
          >
            <ButtonGroup.Separator />
            <ChevronDown width={14} height={14} aria-hidden="true" />
          </Menu.Trigger>
        </ButtonGroup>
        <Menu.Portal>
          <Menu.Positioner sideOffset={8} align="end">
            <Menu.Popup>
              <Menu.Item onClick={copy}>{copyLabel}</Menu.Item>
              <Menu.LinkItem href={sourceUrl}>{sourceLabel}</Menu.LinkItem>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
      <output {...stylex.props(notebook.hidden)}>{status}</output>
    </>
  );
}
