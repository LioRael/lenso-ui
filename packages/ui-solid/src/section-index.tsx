import {
  sectionIndex,
  type SectionIndexItem,
  type SectionIndexOptions,
} from "@lenso/primitives/section-index/core";
import { sectionIndexStyles } from "@lenso/tokens/section-index";
import { createParts, type PartProps } from "@ui-sdk/solid/primitive";
import { For, omit } from "solid-js";
import { sdkPart, type SlotProps } from "./parts.js";

const parts = createParts(sectionIndex, {
  root: "nav",
  item: "a",
});
const Root = sdkPart(parts.Root, "section-index", (props) => [
  sectionIndexStyles.root,
  props.disabled && sectionIndexStyles.disabled,
]);
const Item = sdkPart(parts.Item, "section-index-item", () => sectionIndexStyles.item);

export type SectionIndexProps = SectionIndexOptions &
  PartProps<"nav", ReturnType<typeof sectionIndex>["types"]["state"]> &
  SlotProps;

export function SectionIndex(props: SectionIndexProps) {
  return (
    <Root aria-label="Section index" {...omit(props, "children")}>
      <For each={props.items.map(({ value }) => value)}>
        {(value) => {
          const item = () => props.items.find((item: SectionIndexItem) => item.value === value)!;
          return (
            <Item value={value} href={item().href} disabled={item().disabled}>
              {item().label}
            </Item>
          );
        }}
      </For>
    </Root>
  );
}

export { createSectionIndexController } from "@lenso/primitives/section-index/core";
export type {
  SectionIndexController,
  SectionIndexItem,
  SectionIndexReason,
} from "@lenso/primitives/section-index/core";
