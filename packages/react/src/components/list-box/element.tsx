"use client";
import * as React from "react";
import { useRender } from "@base-ui/react/use-render";

export type CollectionRender = useRender.RenderProp;

export function CollectionElement({
  render,
  ref,
  ...props
}: React.ComponentPropsWithRef<"div"> & { render?: CollectionRender }) {
  return useRender({ defaultTagName: "div", render, ref, props });
}
