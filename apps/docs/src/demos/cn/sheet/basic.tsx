"use client";

import { useState } from "react";
import { Button, GlassButton, Sheet } from "@lenso/ui";
import { IconChevronDown, IconChevronUp } from "@lenso/ui/icons";

const snapPoints = [0.25, 0.525, 1];
const attachedSnapPoints = [0.25, 1];

export function Basic() {
  const [snapPoint, setSnapPoint] = useState<number | string | null>(0.25);
  const expanded = snapPoint === 1;
  return (
    <Sheet
      snapPoints={snapPoints}
      edgeAttachedSnapPoints={attachedSnapPoints}
      snapPoint={snapPoint}
      onSnapPointChange={setSnapPoint}
    >
      <Sheet.Trigger render={<Button />}>查看更改</Sheet.Trigger>
      <Sheet.Portal>
        <Sheet.Backdrop forceRender />
        <Sheet.Viewport>
          <Sheet.Popup>
            <Sheet.Handle />
            <Sheet.Header>
              <Sheet.Close aria-label="关闭" />
              <Sheet.Title>查看更改</Sheet.Title>
              <GlassButton
                isIconOnly
                variant="prominent"
                style={{ width: 44, height: 44 }}
                aria-label={expanded ? "收起面板" : "展开面板"}
                icon={expanded ? <IconChevronDown /> : <IconChevronUp />}
                onClick={() => setSnapPoint(snapPoint === 0.25 ? 0.525 : expanded ? 0.25 : 1)}
              />
            </Sheet.Header>
            <Sheet.Body>
              <Sheet.Description>
                拖动顶部，在低位贴底、中位悬浮和完全展开之间切换。
              </Sheet.Description>
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
