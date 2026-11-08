import { renderToString } from "react-dom/server";
import { FirstPaintFixture } from "./first-paint-fixture";
export function render(theme: "light" | "dark") {
  return renderToString(<FirstPaintFixture theme={theme} />);
}
