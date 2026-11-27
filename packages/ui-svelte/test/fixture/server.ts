import { render } from "svelte/server";
import App from "./app.svelte";

export function renderApp() {
  return render(App).body;
}
