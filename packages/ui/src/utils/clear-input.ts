/** Route clearing through the input so native Field validation and callbacks remain intact. */
export function clearInput(input: HTMLInputElement) {
  const view = input.ownerDocument.defaultView;
  if (!view || input.disabled || input.readOnly) return;
  Object.getOwnPropertyDescriptor(view.HTMLInputElement.prototype, "value")?.set?.call(input, "");
  input.dispatchEvent(new view.Event("input", { bubbles: true }));
  input.focus();
}
