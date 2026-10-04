// Production-consumer contract proof; deliberately not a source-story export.
import { useRef, useState, type CSSProperties } from "react";
import { Button, Disclosure, Link, Tabs } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { navigation as s } from "./navigation.stylex";

export function NavigationContractFixture() {
  const anchor = useRef<HTMLAnchorElement>(null);
  const trigger = useRef<HTMLElement>(null);
  const renderedButton = useRef<HTMLElement>(null);
  const tab = useRef<HTMLElement>(null);
  const [proof, setProof] = useState("Not checked");
  const [clicks, setClicks] = useState(0);
  return (
    <div {...stylex.props(s.column)}>
      <Link
        ref={anchor}
        href="#consumer-anchor"
        render={<a data-consumer-anchor="" href="#consumer-anchor" aria-label="Composed anchor" />}
        onClick={() => setClicks((value) => value + 1)}
      >
        Composed anchor
      </Link>
      <Disclosure>
        <Disclosure.Trigger
          ref={trigger}
          render={<Button ref={renderedButton} variant="secondary" />}
          xstyle={[s.trigger, s.contractWidth(280)]}
          style={(state: { open: boolean }): CSSProperties => ({
            borderTopWidth: state.open ? 3 : 1,
            borderTopStyle: "solid",
          })}
        >
          Composed disclosure
        </Disclosure.Trigger>
        <Disclosure.Content>
          <Disclosure.Body>Consumer content</Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>
      <Disclosure>
        <Disclosure.Trigger
          xstyle={s.contractWidth(280)}
          style={(state: { open: boolean }): CSSProperties => ({
            borderTopWidth: state.open ? 3 : 1,
            borderTopStyle: "solid",
          })}
        >
          Dynamic disclosure
        </Disclosure.Trigger>
        <Disclosure.Content>
          <Disclosure.Body>Dynamic StyleX content</Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>
      <Tabs dir="rtl" defaultValue="one">
        <Tabs.ListContainer>
          <Tabs.List aria-label="Native manual RTL tabs" activateOnFocus={false}>
            <Tabs.Tab value="one" ref={tab}>
              One
            </Tabs.Tab>
            <Tabs.Tab value="two">Two</Tabs.Tab>
            <Tabs.Indicator />
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel value="one">First section</Tabs.Panel>
        <Tabs.Panel value="two">Second section</Tabs.Panel>
      </Tabs>
      <Button
        onClick={() =>
          setProof(
            anchor.current === document.querySelector("[data-consumer-anchor]") &&
              anchor.current?.tagName === "A" &&
              trigger.current === renderedButton.current &&
              trigger.current?.tagName === "BUTTON" &&
              tab.current?.getAttribute("role") === "tab"
              ? "Refs passed"
              : "Refs failed",
          )
        }
      >
        Verify native refs
      </Button>
      <output aria-label="Ref proof">{proof}</output>
      <output aria-label="Anchor clicks">{clicks}</output>
    </div>
  );
}
