// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 long-press-trigger, Apache-2.0.
import { useEffect, useRef, useState } from "react";
import { Button, Menu } from "@lenso/ui";
import { ActionItem, Popup } from "../../en/menu/_shared";
export function LongPressTrigger() {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pointerActive = useRef(false);
  const cancel = () => {
    clearTimeout(timer.current);
    timer.current = undefined;
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <Menu
      open={open}
      onOpenChange={(next, details) => {
        if (details.reason === "trigger-press" && pointerActive.current) return;
        setOpen(next);
      }}
    >
      <Menu.Trigger
        render={<Button aria-label="菜单" variant="secondary" />}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          pointerActive.current = true;
          cancel();
          timer.current = setTimeout(() => setOpen(true), 500);
        }}
        onPointerUp={cancel}
        onPointerCancel={cancel}
        onPointerLeave={cancel}
        onKeyDown={() => {
          pointerActive.current = false;
        }}
      >
        长按
      </Menu.Trigger>
      <Popup>
        <ActionItem label="新建文件" />
        <ActionItem label="打开文件" />
        <ActionItem label="保存文件" />
        <ActionItem label="删除文件" variant="danger" />
      </Popup>
    </Menu>
  );
}
