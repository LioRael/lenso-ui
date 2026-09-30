"use client";

import { demos } from "@/demos";

export function LivePreview({ name }: { name: string }) {
  const Component = demos[name];
  if (!Component) throw new Error(`Unregistered live preview: ${name}`);
  return <Component />;
}
