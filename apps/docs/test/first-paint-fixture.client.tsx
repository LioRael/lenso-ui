import { hydrateRoot } from "react-dom/client";
import { FirstPaintFixture } from "./first-paint-fixture";
hydrateRoot(
  document.getElementById("fixture")!,
  <FirstPaintFixture
    theme={document.documentElement.dataset["theme"] === "dark" ? "dark" : "light"}
  />,
);
