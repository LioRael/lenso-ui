import * as React from "react";
import type { Menu } from "@base-ui/react/menu";

export const MenuDismissal = React.createContext<React.RefObject<HTMLDivElement | null> | null>(
  null,
);
export const MenuBackdropAnchor = React.createContext<
  React.RefObject<HTMLElement | null> | undefined
>(undefined);
export const MenuElastic = React.createContext(true);
export const MenuMotion = React.createContext<{
  morphTrigger: boolean;
  trigger: React.RefObject<HTMLElement | null>;
  unmount: () => void;
} | null>(null);

export function useMenuPresentation(
  actionsRef: React.RefObject<Menu.Root.Actions | null> | undefined,
  morphTrigger: boolean,
) {
  const dismissal = React.useRef<HTMLDivElement>(null);
  const trigger = React.useRef<HTMLElement>(null);
  const ownActions = React.useRef<Menu.Root.Actions>(null);
  const actions = actionsRef ?? ownActions;
  const unmount = React.useCallback(() => actions.current?.unmount(), [actions]);
  const motion = React.useMemo(() => ({ trigger, unmount, morphTrigger }), [unmount, morphTrigger]);
  const change = (
    open: boolean,
    details: {
      reason: string;
      isCanceled: boolean;
      cancel(): void;
      preventUnmountOnClose?(): void;
    },
    notify: () => void,
  ) => {
    if (
      !open &&
      details.reason === "outside-press" &&
      dismissal.current?.hasAttribute("data-menu-child-count")
    ) {
      details.cancel();
      return;
    }
    notify();
    if (!open && !details.isCanceled) details.preventUnmountOnClose?.();
  };
  return { dismissal, trigger, actions, motion, change };
}
export function MenuPresentation({
  state,
  elastic,
  children,
}: {
  state: ReturnType<typeof useMenuPresentation>;
  elastic: boolean;
  children: React.ReactNode;
}) {
  return (
    <MenuElastic value={elastic}>
      <MenuDismissal value={state.dismissal}>
        <MenuBackdropAnchor value={state.trigger}>
          <MenuMotion value={state.motion}>{children}</MenuMotion>
        </MenuBackdropAnchor>
      </MenuDismissal>
    </MenuElastic>
  );
}
