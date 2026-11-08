import { createFileRoute } from "@tanstack/react-router";
import { PhotosDemo } from "../components/photos-demo";

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
  component: () => <PhotosDemo />,
});
