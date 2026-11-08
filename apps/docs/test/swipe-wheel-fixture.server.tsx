import { renderToString } from "react-dom/server";
import { SwipeWheelFixture } from "./swipe-wheel-fixture";
export function render(theme: string) {
  return renderToString(<SwipeWheelFixture dark={theme === "dark"} />);
}
