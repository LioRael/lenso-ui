"use client";
import * as React from "react";
import { renderElement, type RenderProp } from "@ui-sdk/react/primitive";

export type CollectionRender = RenderProp;

export function CollectionElement({
  render,
  ref,
  ...props
}: React.ComponentPropsWithRef<"div"> & { render?: CollectionRender }) {
  return renderElement("div", { ...props, ref: ref }, render);
}
