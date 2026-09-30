import { createElement } from "react";
import { renderToString } from "react-dom/server";

export function renderHookOnServer<T>(hook: () => T): { html: string; result: T } {
  let result: T | undefined;
  function Probe() {
    result = hook();
    return null;
  }
  const html = renderToString(createElement(Probe));
  return { html, result: result as T };
}
