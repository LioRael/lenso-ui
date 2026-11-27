import { accordionStyles } from "@lenso/tokens/accordion";
import { groupStyles } from "@lenso/tokens/surface";
import {
  Accordion as SdkRoot,
  AccordionItem as SdkItem,
  AccordionHeader as SdkHeading,
  AccordionTrigger as SdkTrigger,
  AccordionPanel as SdkPanel,
} from "@ui-sdk/vue/accordion";
import { defineComponent, h, inject, provide, type InjectionKey, type PropType } from "vue";
import { disclosureIndicator } from "./disclosure-indicator.js";
import { FieldGroupContext } from "./field-group-context.js";
import { partAttributes, htmlPart, sdkPart, type StyledPart } from "./parts.js";

type AccordionOptions = { variant?: "default" | "surface"; hideSeparator?: boolean };
const Context: InjectionKey<() => { surface: boolean; grouped: boolean; hideSeparator: boolean }> =
  Symbol("Accordion");
const defaults = () => ({ surface: false, grouped: false, hideSeparator: false });

export const AccordionRoot = defineComponent({
  inheritAttrs: false,
  props: { variant: String as PropType<AccordionOptions["variant"]>, hideSeparator: Boolean },
  setup(props, { attrs, slots }) {
    const grouped = inject(FieldGroupContext, false);
    provide(FieldGroupContext, false);
    provide(Context, () => ({
      grouped,
      surface: props.variant === "surface",
      hideSeparator: props.hideSeparator,
    }));
    return () =>
      h(
        SdkRoot,
        partAttributes(
          "accordion",
          [
            accordionStyles.root,
            props.variant === "surface" && !grouped && groupStyles.surface,
            grouped && groupStyles.divided,
          ],
          attrs,
        ),
        slots,
      );
  },
}) as unknown as StyledPart<typeof SdkRoot, AccordionOptions>;
export const AccordionItem = defineComponent({
  inheritAttrs: false,
  props: { hideSeparator: { type: Boolean, default: undefined } },
  setup(props, { attrs, slots }) {
    const context = inject(Context, defaults);
    return () => {
      const { surface, grouped, hideSeparator } = context();
      return h(
        SdkItem,
        partAttributes(
          "accordion-item",
          [
            accordionStyles.item,
            (surface || grouped) && groupStyles.divided,
            (props.hideSeparator ?? hideSeparator) && accordionStyles.hideSeparator,
          ],
          attrs,
        ),
        slots,
      );
    };
  },
}) as unknown as StyledPart<typeof SdkItem, { hideSeparator?: boolean }>;
export const AccordionHeading: StyledPart<typeof SdkHeading> = sdkPart(
  SdkHeading,
  "accordion-heading",
  () => accordionStyles.heading,
);
export const AccordionTrigger = defineComponent({
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const context = inject(Context, defaults);
    return () => {
      const { surface, grouped } = context();
      return h(
        SdkTrigger,
        partAttributes(
          "accordion-trigger",
          [
            accordionStyles.trigger,
            surface && !grouped && accordionStyles.surfaceTrigger,
            grouped && groupStyles.row,
            grouped && accordionStyles.formTrigger,
          ],
          attrs,
        ),
        slots,
      );
    };
  },
}) as unknown as StyledPart<typeof SdkTrigger>;
export const AccordionPanel: StyledPart<typeof SdkPanel> = sdkPart(
  SdkPanel,
  "accordion-panel",
  () => accordionStyles.panel,
);
export const AccordionBody = htmlPart("div", "accordion-body", () => accordionStyles.body);
export const AccordionIndicator = disclosureIndicator(
  "accordion-indicator",
  accordionStyles.indicator,
);

export const Accordion: typeof AccordionRoot & {
  Root: typeof AccordionRoot;
  Item: typeof AccordionItem;
  Heading: typeof AccordionHeading;
  Trigger: typeof AccordionTrigger;
  Panel: typeof AccordionPanel;
  Body: typeof AccordionBody;
  Indicator: typeof AccordionIndicator;
} = Object.assign(AccordionRoot, {
  Root: AccordionRoot,
  Item: AccordionItem,
  Heading: AccordionHeading,
  Trigger: AccordionTrigger,
  Panel: AccordionPanel,
  Body: AccordionBody,
  Indicator: AccordionIndicator,
});
