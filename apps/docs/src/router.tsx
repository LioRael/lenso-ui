import { createRouter } from "@tanstack/react-router";
import { NotFound } from "./components/not-found";
import { routeTree } from "./routeTree.gen";
export function getRouter() {
  return createRouter({
    defaultNotFoundComponent: NotFound,
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
  });
}
