"use client";

import { demosByLocale } from "@/demos/generated";
import type { DemoLocale } from "@/lib/demo-locale";

export function LivePreview({ name, locale }: { name: string; locale: DemoLocale }) {
  const Component = demosByLocale[locale][name];
  if (!Component) throw new Error(`Unregistered live preview: ${name}`);
  return <Component />;
}
