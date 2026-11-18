import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PhotosDemo } from "../components/photos-demo";
import type { PhotosFrame } from "../lib/photos-model";

function PhotosPage() {
  const [model] = useState(() =>
    typeof window === "undefined"
      ? undefined
      : (window.frameElement as PhotosFrame | null)?.photosModel,
  );
  return <PhotosDemo model={model} />;
}

export const Route = createFileRoute("/$locale/photos")({
  head: () => ({
    meta: [
      { title: "Photos · Lenso UI demo" },
      {
        name: "description",
        content: "An interactive Apple Photos-inspired sample library built with Lenso UI.",
      },
    ],
  }),
  component: PhotosPage,
});
