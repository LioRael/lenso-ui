"use client";
/** HeroUI v3.2.6 source helper. Copyright NextUI Inc. Apache-2.0. */
import dynamic from "next/dynamic";
export const FormatOptions = dynamic(
  () => import("./format-options").then((mod) => mod.FormatOptions),
  { ssr: false },
);
