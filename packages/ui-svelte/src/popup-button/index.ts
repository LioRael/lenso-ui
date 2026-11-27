import PopupButtonRoot from "./popup-button-root.svelte";
import PopupButtonIndicator from "./popup-button-indicator.svelte";

export { PopupButtonRoot, PopupButtonIndicator };
export const PopupButton: typeof PopupButtonRoot & {
  Root: typeof PopupButtonRoot;
  Indicator: typeof PopupButtonIndicator;
} = Object.assign(PopupButtonRoot, {
  Root: PopupButtonRoot,
  Indicator: PopupButtonIndicator,
});
