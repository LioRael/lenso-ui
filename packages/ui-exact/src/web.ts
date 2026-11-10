import * as stylex from "@stylexjs/stylex";
import { attachGlass } from "@lenso/glass";
import { buttonStyles, buttonSizes, buttonVariants } from "@lenso/tokens/button";
import { glassStyles } from "@lenso/tokens/glass";
import {
  glassButtonStyles,
  glassButtonSizes,
  glassButtonVariants,
} from "@lenso/tokens/glass-button";
import { liquidMaterialStyles } from "@lenso/tokens/materials";

/** The subset of Exact's Web element handle used by these components. */
export interface ExactElement {
  hatch: string;
  element: HTMLElement;
  data: DOMStringMap;
}

const owners = new WeakMap<HTMLElement, () => void>();

function sizeOf(value: string | undefined) {
  if (value === "sm" || value === "md" || value === "lg") return value;
  throw new RangeError(`Lenso size must be sm, md or lg; received ${value}`);
}

/** Decorate the existing node; Exact keeps ownership of its events and state. */
export function element(handle: ExactElement) {
  if (handle.hatch !== "lenso-ui") return;
  const node = handle.element;
  const { lensoKind: kind, lensoSize, lensoVariant: variant } = handle.data;
  let compiled: ReturnType<typeof stylex.props>;
  let optics = false;
  let profileKey = "glass-small";

  switch (kind) {
    case "glass":
      compiled = stylex.props(glassStyles.root, glassStyles.optics, glassStyles.foreground);
      optics = true;
      break;
    case "button": {
      const size = sizeOf(lensoSize);
      if (variant !== "prominent" && variant !== "bordered" && variant !== "borderless")
        throw new RangeError(`Unknown Lenso Button variant: ${variant}`);
      compiled = stylex.props(buttonStyles.root, buttonSizes[size], buttonVariants[variant]);
      break;
    }
    case "glass-button": {
      const size = sizeOf(lensoSize);
      if (variant !== "default" && variant !== "prominent")
        throw new RangeError(`Unknown Lenso GlassButton variant: ${variant}`);
      compiled = stylex.props(
        glassButtonStyles.root,
        liquidMaterialStyles.small,
        glassButtonStyles.backdrop,
        glassButtonSizes[size],
        glassButtonVariants[variant],
        glassButtonStyles.interaction,
      );
      optics = !node.matches(":disabled");
      profileKey = variant;
      break;
    }
    default:
      throw new RangeError(`Unknown Lenso component: ${kind}`);
  }

  owners.get(node)?.();
  const classes =
    compiled.className?.split(" ").filter((name) => name && !node.classList.contains(name)) ?? [];
  node.classList.add(...classes);
  const stop = optics ? attachGlass(node, { profileKey, liveBackdrop: true }) : undefined;
  owners.set(node, () => {
    stop?.();
    node.classList.remove(...classes);
  });
}

/** Called before Exact removes or recycles a node. */
export function elementEnded(handle: ExactElement) {
  if (handle.hatch !== "lenso-ui") return;
  owners.get(handle.element)?.();
  owners.delete(handle.element);
}
