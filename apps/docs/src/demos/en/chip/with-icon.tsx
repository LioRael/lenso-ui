"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { ChevronDown, CircleCheckFill, CircleFill, Clock, Xmark } from "@gravity-ui/icons";
import { Chip } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../card/display.stylex";

export function ChipWithIcon() {
  return (
    <div {...stylex.props(s.wrap3)}>
      <Chip>
        <CircleFill width={6} />
        <Chip.Label>Information</Chip.Label>
      </Chip>
      <Chip color="success">
        <CircleCheckFill width={12} />
        <Chip.Label>Completed</Chip.Label>
      </Chip>
      <Chip color="warning">
        <Clock width={12} />
        <Chip.Label>Pending</Chip.Label>
      </Chip>
      <Chip color="danger">
        <Xmark width={12} />
        <Chip.Label>Failed</Chip.Label>
      </Chip>
      <Chip color="accent">
        <Chip.Label>Label</Chip.Label>
        <ChevronDown width={12} />
      </Chip>
    </div>
  );
}
