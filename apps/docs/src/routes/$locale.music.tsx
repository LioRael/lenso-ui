import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MusicDemo } from "../components/music-demo";
import type { MusicFrame } from "../lib/music-model";

function MusicPage() {
  const [model] = useState(() =>
    typeof window === "undefined"
      ? undefined
      : (window.frameElement as MusicFrame | null)?.musicModel,
  );
  return <MusicDemo model={model} />;
}

export const Route = createFileRoute("/$locale/music")({
  head: () => ({
    meta: [
      { title: "Music · Lenso UI demo" },
      {
        name: "description",
        content: "An interactive Apple Music-inspired sample player built with Lenso UI.",
      },
    ],
  }),
  component: MusicPage,
});
