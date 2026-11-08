"use client";

// Native input retains free text independently of selection.
import { AnimalPicker } from "./allows-custom-value--shared";
export function AllowsCustomValue() {
  return (
    <AnimalPicker placeholder="搜索或输入动物…" description="可输入任意动物名称，即使不在列表中" />
  );
}
