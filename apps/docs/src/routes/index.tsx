import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "../components/home-page";
import { homeHead } from "../lib/route-head";
export const Route = createFileRoute("/")({
  head: () => homeHead("en"),
  component: () => <HomePage locale="en" />,
});
