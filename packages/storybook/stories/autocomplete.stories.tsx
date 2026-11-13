import type { Meta } from "@storybook/react-vite";
import { Autocomplete } from "@lenso/ui";
import DefaultExample from "../../../apps/docs/src/demos/en/autocomplete/default";
import { Variants as VariantsExample } from "../../../apps/docs/src/demos/en/autocomplete/variants";
import { Controlled as ControlledExample } from "../../../apps/docs/src/demos/en/autocomplete/controlled";
import { Required as RequiredExample } from "../../../apps/docs/src/demos/en/autocomplete/required";
import { FullWidth as FullWidthExample } from "../../../apps/docs/src/demos/en/autocomplete/full-width";
import { WithDescription as DescriptionExample } from "../../../apps/docs/src/demos/en/autocomplete/with-description";
import { WithDisabledOptions as DisabledOptionsExample } from "../../../apps/docs/src/demos/en/autocomplete/with-disabled-options";
import { ControlledOpenState as OpenExample } from "../../../apps/docs/src/demos/en/autocomplete/controlled-open-state";
import { AsynchronousFiltering as AsyncExample } from "../../../apps/docs/src/demos/en/autocomplete/asynchronous-filtering";
import { LocationSearch as LocationExample } from "../../../apps/docs/src/demos/en/autocomplete/location-search";
export default {
  component: Autocomplete,
  title: "Components/Pickers/Autocomplete",
  parameters: { layout: "centered" },
} satisfies Meta<typeof Autocomplete>;
export const Default = { render: () => <DefaultExample /> };
export const Variants = { render: () => <VariantsExample /> };
export const Controlled = { render: () => <ControlledExample /> };
export const Required = { render: () => <RequiredExample /> };
export const FullWidth = { render: () => <FullWidthExample /> };
export const WithDescription = { render: () => <DescriptionExample /> };
export const WithDisabledOptions = { render: () => <DisabledOptionsExample /> };
export const ControlledOpenState = { render: () => <OpenExample /> };
export const AsynchronousFiltering = { render: () => <AsyncExample /> };
export const LocationSearch = { render: () => <LocationExample /> };
