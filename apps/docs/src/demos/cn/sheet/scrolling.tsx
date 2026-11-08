"use client";

import { useState } from "react";
import { Button, GlassButton, Sheet } from "@lenso/ui";
import { IconChevronDown, IconChevronUp } from "@lenso/ui/icons";

export function Scrolling() {
  const [snapPoint, setSnapPoint] = useState<number | string | null>(1);
  const expanded = snapPoint === 1;
  return (
    <Sheet snapPoint={snapPoint} onSnapPointChange={setSnapPoint}>
      <Sheet.Trigger render={<Button />}>打开笔记</Sheet.Trigger>
      <Sheet.Portal>
        <Sheet.Backdrop forceRender />
        <Sheet.Viewport>
          <Sheet.Popup>
            <Sheet.Handle />
            <Sheet.Header>
              <Sheet.Close aria-label="关闭" />
              <Sheet.Title>笔记</Sheet.Title>
              <GlassButton
                isIconOnly
                variant="prominent"
                style={{ width: 44, height: 44 }}
                aria-label={expanded ? "收起面板" : "展开面板"}
                icon={expanded ? <IconChevronDown /> : <IconChevronUp />}
                onClick={() => setSnapPoint(expanded ? 0.525 : 1)}
              />
            </Sheet.Header>
            <Sheet.Body>
              <Sheet.Description>滚动笔记时，标题和底部操作保持可见。</Sheet.Description>
              {Array.from({ length: 40 }, (_, index) => (
                <p key={index}>笔记 {index + 1}</p>
              ))}
            </Sheet.Body>
            <Sheet.Footer>
              <Sheet.Close render={<Button variant="prominent" />}>完成</Sheet.Close>
            </Sheet.Footer>
          </Sheet.Popup>
        </Sheet.Viewport>
      </Sheet.Portal>
    </Sheet>
  );
}
