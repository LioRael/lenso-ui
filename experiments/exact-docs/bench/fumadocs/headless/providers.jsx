"use client";
import { NextProvider } from "fumadocs-core/framework/next";
import { BenchLink, Counter, useScope } from "./client";
export function Providers({ children }) {
  useScope();
  return (
    <NextProvider Link={BenchLink}>
      <Counter />
      {children}
    </NextProvider>
  );
}
