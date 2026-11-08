import {
  cloneElement,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type SyntheticEvent,
} from "react";

export function guardLoadingActivation<E extends SyntheticEvent>(
  handler?: (event: E) => void,
  keyboard = false,
) {
  return (event: E) => {
    if (!keyboard || ["Enter", " "].includes((event as unknown as KeyboardEvent).key)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    handler?.(event);
  };
}

export function protectLoadingRender(element: ReactElement) {
  const rendered = element as ReactElement<HTMLAttributes<HTMLElement>>;
  // Base UI runs render-element handlers first, so guarding only the Root is too late.
  return cloneElement(rendered, {
    onClickCapture: guardLoadingActivation(rendered.props.onClickCapture),
    onDoubleClickCapture: guardLoadingActivation(rendered.props.onDoubleClickCapture),
    onPointerDownCapture: guardLoadingActivation(rendered.props.onPointerDownCapture),
    onPointerUpCapture: guardLoadingActivation(rendered.props.onPointerUpCapture),
    onKeyDownCapture: guardLoadingActivation(rendered.props.onKeyDownCapture, true),
    onKeyUpCapture: guardLoadingActivation(rendered.props.onKeyUpCapture, true),
  });
}
