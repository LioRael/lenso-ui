import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/docs/")({
  beforeLoad: () => {
    throw redirect({
      to: "/$locale/docs/$",
      params: { locale: "en", _splat: "react/getting-started" },
    });
  },
});
