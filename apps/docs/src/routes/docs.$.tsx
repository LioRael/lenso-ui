import { createFileRoute, redirect } from "@tanstack/react-router";
import { canonicalSlug } from "../lib/source";
export const Route = createFileRoute("/docs/$")({
  beforeLoad: ({ params }) => {
    const slug = canonicalSlug(params._splat ?? "react/getting-started");
    throw redirect({ to: "/$locale/docs/$", params: { locale: "en", _splat: slug } });
  },
});
