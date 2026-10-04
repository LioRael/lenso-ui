// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 drawer-controlled (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { Button, CloseIcon, Drawer, useOverlayState } from "@lenso/ui";
import React from "react";
import { styles } from "../../en/drawer/styles";
export function Controlled() {
  const [isOpen, setIsOpen] = React.useState(false);
  const state = useOverlayState();
  return (
    <div {...stylex.props(styles.controlled)}>
      <div {...stylex.props(styles.section)}>
        <h3 {...stylex.props(styles.heading)}>配合 React.useState()</h3>
        <p {...stylex.props(styles.explanation)}>
          Control the drawer using React's <code>useState</code> hook for simple state management.
        </p>
        <Drawer.Provider>
          <Drawer open={isOpen} onOpenChange={setIsOpen} swipeDirection="right">
            <div {...stylex.props(styles.stateCard)}>
              <p {...stylex.props(styles.status)}>
                状态： <span {...stylex.props(styles.statusValue)}>{isOpen ? "打开" : "关闭"}</span>
              </p>
              <div {...stylex.props(styles.actions)}>
                <Drawer.Trigger render={<Button size="sm" variant="secondary" />}>
                  打开抽屉
                </Drawer.Trigger>
                <Button size="sm" variant="tertiary" onClick={() => setIsOpen(!isOpen)}>
                  切换
                </Button>
              </div>
            </div>
            <Drawer.Portal>
              <Drawer.Backdrop />
              <Drawer.Viewport>
                <Drawer.Popup>
                  <Drawer.Content>
                    <Drawer.Close
                      aria-label="Close drawer"
                      render={
                        <Button
                          isIconOnly
                          size="sm"
                          variant="tertiary"
                          xstyle={styles.cornerClose}
                        />
                      }
                    >
                      <CloseIcon />
                    </Drawer.Close>
                    <Drawer.Header>
                      <Drawer.Title>由 useState() 控制</Drawer.Title>
                    </Drawer.Header>
                    <Drawer.Body>
                      <p>
                        This drawer is controlled by React's <code>useState</code> hook. Pass{" "}
                        <code>isOpen</code> and <code>onOpenChange</code> props to manage the drawer
                        state externally.
                      </p>
                    </Drawer.Body>
                    <Drawer.Footer>
                      <Drawer.Close render={<Button variant="secondary" />}>关闭</Drawer.Close>
                    </Drawer.Footer>
                  </Drawer.Content>
                </Drawer.Popup>
              </Drawer.Viewport>
            </Drawer.Portal>
          </Drawer>
        </Drawer.Provider>
      </div>
      <div {...stylex.props(styles.section)}>
        <h3 {...stylex.props(styles.heading)}>配合 useOverlayState()</h3>
        <p {...stylex.props(styles.explanation)}>
          Use the <code>useOverlayState</code> hook for a cleaner API with convenient methods like{" "}
          <code>open()</code>, <code>close()</code>, and <code>toggle()</code>.
        </p>
        <Drawer.Provider>
          <Drawer open={state.isOpen} onOpenChange={state.setOpen} swipeDirection="right">
            <div {...stylex.props(styles.stateCard)}>
              <p {...stylex.props(styles.status)}>
                状态：{" "}
                <span {...stylex.props(styles.statusValue)}>{state.isOpen ? "打开" : "关闭"}</span>
              </p>
              <div {...stylex.props(styles.actions)}>
                <Drawer.Trigger
                  render={<Button size="sm" variant="secondary" />}
                  onClick={state.open}
                >
                  打开抽屉
                </Drawer.Trigger>
                <Button size="sm" variant="tertiary" onClick={state.toggle}>
                  切换
                </Button>
              </div>
            </div>
            <Drawer.Portal>
              <Drawer.Backdrop />
              <Drawer.Viewport>
                <Drawer.Popup>
                  <Drawer.Content>
                    <Drawer.Close
                      aria-label="Close drawer"
                      render={
                        <Button
                          isIconOnly
                          size="sm"
                          variant="tertiary"
                          xstyle={styles.cornerClose}
                        />
                      }
                    >
                      <CloseIcon />
                    </Drawer.Close>
                    <Drawer.Header>
                      <Drawer.Title>由 useOverlayState() 控制</Drawer.Title>
                    </Drawer.Header>
                    <Drawer.Body>
                      <p>
                        The <code>useOverlayState</code> hook provides dedicated methods for common
                        operations. No need to manually create callbacks—just use{" "}
                        <code>state.open()</code>, <code>state.close()</code>, or{" "}
                        <code>state.toggle()</code>.
                      </p>
                    </Drawer.Body>
                    <Drawer.Footer>
                      <Drawer.Close render={<Button variant="secondary" />}>关闭</Drawer.Close>
                    </Drawer.Footer>
                  </Drawer.Content>
                </Drawer.Popup>
              </Drawer.Viewport>
            </Drawer.Portal>
          </Drawer>
        </Drawer.Provider>
      </div>
    </div>
  );
}
