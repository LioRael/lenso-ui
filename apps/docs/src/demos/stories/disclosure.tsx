"use client";
import { Disclosure } from "@lenso/ui";
export interface DisclosureStoryProps {
  disabled: boolean;
  defaultOpen: boolean;
  label: string;
}
export const initialArgs: DisclosureStoryProps = /* story-args:start */ {
  label: "Shipping details",
  disabled: false,
  defaultOpen: true,
}; /* story-args:end */

export function Preview(overrides: DisclosureStoryProps) {
  const args = { ...initialArgs, ...overrides };
  const { label, ...props } = args;
  return (
    <Disclosure {...props}>
      <Disclosure.Heading>
        <Disclosure.Trigger>
          {label}
          <Disclosure.Indicator />
        </Disclosure.Trigger>
      </Disclosure.Heading>
      <Disclosure.Content>
        <Disclosure.Body>Orders ship within two business days.</Disclosure.Body>
      </Disclosure.Content>
    </Disclosure>
  );
}
