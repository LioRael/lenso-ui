import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/docs/$")({
  beforeLoad: async ({ params }) => {
    const { canonicalSlug } = await import("../lib/source");
    const slug = canonicalSlug(params._splat ?? "react/getting-started");
    throw redirect({ to: "/$locale/docs/$", params: { locale: "en", _splat: slug } });
  },
});
