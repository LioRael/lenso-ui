"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface BreadcrumbsStoryProps extends Pick<
  StoryComponentProps<typeof Breadcrumbs>,
  "disabled"
> {}
export const initialArgs: BreadcrumbsStoryProps = /* story-args:start */ {
  disabled: false,
}; /* story-args:end */

import { Breadcrumbs } from "@lenso/ui";

export function BreadcrumbsBasic(overrides: BreadcrumbsStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <Breadcrumbs {...args}>
      <Breadcrumbs.Item href="#">Home</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#">Products</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#">Electronics</Breadcrumbs.Item>
      <Breadcrumbs.Item>Laptop</Breadcrumbs.Item>
    </Breadcrumbs>
  );
}
export default BreadcrumbsBasic;
