import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/$locale/docs/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/$locale/docs/$",
      params: { locale: params.locale, _splat: "react/getting-started" },
    });
  },
});
