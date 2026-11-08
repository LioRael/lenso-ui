"use client";
// Copyright NextUI Inc. Apache-2.0.
import { lazy } from "react";
export const FormatOptions = lazy(() =>
  import("./format-options").then((module) => ({ default: module.FormatOptions })),
);
