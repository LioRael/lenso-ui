import { renderElement, type RenderProp } from "@ui-sdk/react/primitive";

// Keep SDK-managed slots intact; material hooks use a separate presentation marker.
export function slotRender<State>(
  tag: string,
  slot: unknown,
  render?: RenderProp<State>,
  attributes?: Record<string, unknown>,
): RenderProp<State> {
  return (props, state) =>
    renderElement(tag, { ...props, "data-lenso-slot": slot, ...attributes }, render, state);
}
