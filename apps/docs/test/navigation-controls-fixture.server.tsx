import { renderToString } from "react-dom/server";
import { NavigationControlsFixture } from "./navigation-controls-fixture";
export function render(theme: string) {
  return renderToString(<NavigationControlsFixture dark={theme === "dark"} />);
}
