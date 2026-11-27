import { buttonGroupStyles } from "@lenso/tokens/button-group";
import { attachFusion, type FusionGroup } from "@lenso/glass/fusion";
import { glassContainerStyles } from "@lenso/tokens/glass-container";
import { GlassFusionContext } from "./glass.jsx";
import { attributes, htmlPart } from "./parts.js";

import {
  createEffect,
  createSignal,
  useContext,
  omit,
  createContext,
  type ComponentProps,
} from "solid-js";
export type GroupOptions = {
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "bordered" | "borderless" | "prominent" | "default";
  orientation?: "horizontal" | "vertical";
  fullWidth?: boolean;
  isDetached?: boolean;
  destructive?: boolean;
  tint?: string;
};
export const ButtonGroupContext = createContext<GroupOptions | null>(null);
const Fieldset = htmlPart<"fieldset", GroupOptions>(
  "fieldset",
  "button-group",
  (props) => [
    glassContainerStyles.root,
    buttonGroupStyles.root,
    buttonGroupStyles[props.orientation ?? "horizontal"],
    props.fullWidth && buttonGroupStyles.fullWidth,
    props.isDetached && buttonGroupStyles.detached,
  ],
  "variant",
  "size",
  "tint",
  "destructive",
  "orientation",
  "fullWidth",
  "isDetached",
);
export function ButtonGroupRoot(props: ComponentProps<typeof Fieldset>) {
  const [host, setHost] = createSignal<HTMLFieldSetElement>();
  const [surface, setSurface] = createSignal<HTMLDivElement>();
  const group: FusionGroup = { members: new Set(), update: () => {} };
  createEffect(
    () => [host(), surface(), props.isDetached] as const,
    ([node, paint, detached]) =>
      node && paint && !detached ? attachFusion(node, paint, group, 18) : undefined,
  );
  return (
    <ButtonGroupContext value={props}>
      <GlassFusionContext value={() => (props.isDetached ? undefined : group)}>
        <Fieldset
          {...omit(props, "ref", "children")}
          ref={[setHost, props.ref]}
          data-lenso-glass-group={props.isDetached ? undefined : ""}
        >
          {props.children}
          <div
            {...attributes(glassContainerStyles.surface)}
            ref={setSurface}
            data-lenso-glass-fusion=""
            aria-hidden="true"
            hidden
          >
            <div {...attributes(glassContainerStyles.rim)} />
          </div>
        </Fieldset>
      </GlassFusionContext>
    </ButtonGroupContext>
  );
}
const Separator = htmlPart("span", "button-group-separator", () => buttonGroupStyles.separator);

export function ButtonGroupSeparator(props: ComponentProps<typeof Separator>) {
  const group = useContext(ButtonGroupContext);
  return (
    <Separator
      aria-hidden="true"
      {...props}
      xstyle={[
        group?.orientation === "vertical"
          ? buttonGroupStyles.separatorVertical
          : buttonGroupStyles.separatorHorizontal,
        props.xstyle,
      ]}
    />
  );
}
export const ButtonGroup = Object.assign(ButtonGroupRoot, {
  Root: ButtonGroupRoot,
  Separator: ButtonGroupSeparator,
});
