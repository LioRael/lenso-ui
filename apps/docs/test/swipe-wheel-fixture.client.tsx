import { hydrateRoot } from "react-dom/client";
import { SwipeWheelFixture } from "./swipe-wheel-fixture";
hydrateRoot(
  document.getElementById("fixture")!,
  <SwipeWheelFixture dark={document.documentElement.dataset["theme"] === "dark"} />,
);
