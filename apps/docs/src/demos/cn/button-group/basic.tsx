// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import {
  ChevronLeft,
  ChevronRight,
  TextAlignCenter,
  TextAlignLeft,
  TextAlignRight,
} from "@gravity-ui/icons";
import { Button, ButtonGroup } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { demoStyles } from "../../demo.stylex";
export function Basic() {
  const [page, setPage] = useState(1);
  const [alignment, setAlignment] = useState("左对齐");
  return (
    <div {...stylex.props(demoStyles.wideColumn)}>
      <ButtonGroup variant="tertiary" aria-label="Example page navigation">
        <Button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>
          <ChevronLeft aria-hidden="true" />
          上一页
        </Button>
        <Button onClick={() => setPage((value) => value + 1)}>
          <ButtonGroup.Separator />
          下一页
          <ChevronRight aria-hidden="true" />
        </Button>
      </ButtonGroup>
      <output>Page {page}</output>
      <ButtonGroup variant="tertiary" aria-label="Text alignment">
        <Button isIconOnly aria-label="左对齐" onClick={() => setAlignment("Left")}>
          <TextAlignLeft aria-hidden="true" />
        </Button>
        <Button isIconOnly aria-label="居中对齐" onClick={() => setAlignment("Center")}>
          <ButtonGroup.Separator />
          <TextAlignCenter aria-hidden="true" />
        </Button>
        <Button isIconOnly aria-label="右对齐" onClick={() => setAlignment("Right")}>
          <ButtonGroup.Separator />
          <TextAlignRight aria-hidden="true" />
        </Button>
      </ButtonGroup>
      <output>{alignment} aligned</output>
    </div>
  );
}
