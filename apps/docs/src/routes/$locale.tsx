import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { isLocale } from "../lib/source";
export const Route = createFileRoute("/$locale")({
  beforeLoad: ({ params }) => {
    if (!isLocale(params.locale)) throw notFound();
  },
  component: Outlet,
});
