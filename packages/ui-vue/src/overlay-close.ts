import { closeButtonStyles } from "@lenso/tokens/close-button";
import { defineComponent, h, type Component } from "vue";
import { defaultCloseIcon } from "./close-icon.js";
import { partAttributes, type StyledPart, type StyleXArgument } from "./parts.js";

export function overlayClose<C extends Component & (new (...args: never[]) => { $props: object })>(
  part: C,
  slot: string,
  closeStyle: StyleXArgument,
  actionStyle?: StyleXArgument,
): StyledPart<C> {
  return defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => {
        const bare = !slots["default"] && !slots["render"] && attrs["render"] == null;
        return h(
          part,
          partAttributes(
            slot,
            [
              bare && closeButtonStyles.root,
              bare && closeStyle,
              !bare && !slots["render"] && attrs["render"] == null && actionStyle,
            ],
            { "aria-label": bare ? "Close" : undefined, ...attrs },
          ),
          bare ? { default: defaultCloseIcon } : slots,
        );
      };
    },
  }) as unknown as StyledPart<C>;
}
