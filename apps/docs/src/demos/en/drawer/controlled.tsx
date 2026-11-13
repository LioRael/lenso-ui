"use client";

import * as stylex from "@stylexjs/stylex";
import { Button, Drawer, useOverlayState } from "@lenso/ui";
import React from "react";
import { styles } from "./styles";

export function Controlled() {
  const [isOpen, setIsOpen] = React.useState(false);
  const state = useOverlayState();
  return (
    <div {...stylex.props(styles.controlled)}>
      <div {...stylex.props(styles.section)}>
        <h3 {...stylex.props(styles.heading)}>With React.useState()</h3>
        <p {...stylex.props(styles.explanation)}>
          Control the drawer using React's <code>useState</code>hook for simple state management.
        </p>
        <Drawer open={isOpen} onOpenChange={setIsOpen} side="right">
          <div {...stylex.props(styles.stateCard)}>
            <p {...stylex.props(styles.status)}>
              Status:{" "}
              <span {...stylex.props(styles.statusValue)}>{isOpen ? "open" : "closed"}</span>
            </p>
            <div {...stylex.props(styles.actions)}>
              <Drawer.Trigger render={<Button size="sm" />}>Open Drawer</Drawer.Trigger>
              <Button size="sm" onClick={() => setIsOpen(!isOpen)}>
                Toggle
              </Button>
            </div>
          </div>
          <Drawer.Backdrop />
          <Drawer.Content>
            <Drawer.Layout>
              <Drawer.Close aria-label="Close drawer" />
              <Drawer.Header>
                <Drawer.Title>Controlled with useState()</Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                <p>
                  This drawer is controlled by React's <code>useState</code>hook. Pass{" "}
                  <code>isOpen</code>and <code>onOpenChange</code>props to manage the drawer state
                  externally.
                </p>
              </Drawer.Body>
              <Drawer.Footer>
                <Drawer.Close render={<Button variant="bordered" />}>Close</Drawer.Close>
              </Drawer.Footer>
            </Drawer.Layout>
          </Drawer.Content>
        </Drawer>
      </div>
      <div {...stylex.props(styles.section)}>
        <h3 {...stylex.props(styles.heading)}>With useOverlayState()</h3>
        <p {...stylex.props(styles.explanation)}>
          Use the <code>useOverlayState</code>hook for a cleaner API with convenient methods like{" "}
          <code>open()</code>, <code>close()</code>, and <code>toggle()</code>.
        </p>
        <Drawer open={state.isOpen} onOpenChange={state.setOpen} side="right">
          <div {...stylex.props(styles.stateCard)}>
            <p {...stylex.props(styles.status)}>
              Status:{" "}
              <span {...stylex.props(styles.statusValue)}>{state.isOpen ? "open" : "closed"}</span>
            </p>
            <div {...stylex.props(styles.actions)}>
              <Drawer.Trigger render={<Button size="sm" />} onClick={state.open}>
                Open Drawer
              </Drawer.Trigger>
              <Button size="sm" onClick={state.toggle}>
                Toggle
              </Button>
            </div>
          </div>
          <Drawer.Backdrop />
          <Drawer.Content>
            <Drawer.Layout>
              <Drawer.Close aria-label="Close drawer" />
              <Drawer.Header>
                <Drawer.Title>Controlled with useOverlayState()</Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                <p>
                  The <code>useOverlayState</code>hook provides dedicated methods for common
                  operations. No need to manually create callbacks—just use{" "}
                  <code>state.open()</code>, <code>state.close()</code>, or{" "}
                  <code>state.toggle()</code>.
                </p>
              </Drawer.Body>
              <Drawer.Footer>
                <Drawer.Close render={<Button variant="bordered" />}>Close</Drawer.Close>
              </Drawer.Footer>
            </Drawer.Layout>
          </Drawer.Content>
        </Drawer>
      </div>
    </div>
  );
}
