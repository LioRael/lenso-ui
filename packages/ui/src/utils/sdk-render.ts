import { renderElement, type RenderProp } from "@ui-sdk/react/primitive";

// UI SDK owns data-slot on parts; Lenso's material hooks need their public slot names.
export function slotRender<State>(
  tag: string,
  slot: unknown,
  render?: RenderProp<State>,
  attributes?: Record<string, unknown>,
): RenderProp<State> {
  return (props, state) =>
    renderElement(tag, { ...props, "data-slot": slot, ...attributes }, render, state);
}
