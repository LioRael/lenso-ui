import { createRoot } from "react-dom/client";
import { Pill } from "../src/demos/en/toast/pill";

export function mount(host: HTMLElement) {
  const root = createRoot(host);
  root.render(<Pill />);
  return () => root.unmount();
}
