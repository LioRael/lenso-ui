import { hydrateRoot } from "react-dom/client";
import { NavigationControlsFixture } from "./navigation-controls-fixture";
hydrateRoot(
  document.getElementById("fixture")!,
  <NavigationControlsFixture dark={document.documentElement.dataset["theme"] === "dark"} />,
);
