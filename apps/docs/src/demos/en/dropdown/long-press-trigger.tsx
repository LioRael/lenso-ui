"use client";

// Adapted from HeroUI v3.2.6 long-press-trigger, Apache-2.0.
import { useEffect, useRef, useState } from "react";
import { Button, Dropdown } from "@lenso/ui";
import { ActionItem, Popup } from "./_shared";

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
    <Dropdown
      open={open}
      onOpenChange={(next, details) => {
        if (details.reason === "trigger-press" && pointerActive.current) return;
        setOpen(next);
      }}
    >
      <Dropdown.Trigger
        render={<Button aria-label="Menu" variant="secondary" />}
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
        Long Press
      </Dropdown.Trigger>
      <Popup>
        <ActionItem label="New file" />
        <ActionItem label="Open file" />
        <ActionItem label="Save file" />
        <ActionItem label="Delete file" variant="danger" />
      </Popup>
    </Dropdown>
  );
}
