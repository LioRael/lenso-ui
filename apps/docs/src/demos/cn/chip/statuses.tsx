// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Ban, Check, CircleFill, CircleInfo, TriangleExclamation } from "@gravity-ui/icons";
import { Chip } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../../en/card/display.stylex";
export function ChipStatuses() {
  return (
    <div {...stylex.props(s.column4)}>
      <div {...stylex.props(s.wrap3)}>
        <Chip variant="primary">
          <CircleFill width={6} />
          <Chip.Label>默认</Chip.Label>
        </Chip>
        <Chip color="success" variant="primary">
          <CircleFill width={6} />
          <Chip.Label>活跃</Chip.Label>
        </Chip>
        <Chip color="warning" variant="primary">
          <CircleFill width={6} />
          <Chip.Label>待处理</Chip.Label>
        </Chip>
        <Chip color="danger" variant="primary">
          <CircleFill width={6} />
          <Chip.Label>未激活</Chip.Label>
        </Chip>
      </div>
      <div {...stylex.props(s.wrap3)}>
        <Chip>
          <CircleInfo width={12} />
          <Chip.Label>新功能</Chip.Label>
        </Chip>
        <Chip color="success">
          <Check width={12} />
          <Chip.Label>可用</Chip.Label>
        </Chip>
        <Chip color="warning">
          <TriangleExclamation width={12} />
          <Chip.Label>测试版</Chip.Label>
        </Chip>
        <Chip color="danger">
          <Ban width={12} />
          <Chip.Label>已弃用</Chip.Label>
        </Chip>
      </div>
    </div>
  );
}
