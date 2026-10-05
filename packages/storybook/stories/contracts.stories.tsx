import { composeStories, type Meta, type StoryObj } from "@storybook/react-vite";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { FormWorkflowContract } from "./form-workflow-contract.fixture";
import { FormWorkflowInvalidFixture } from "./form-workflow-invalid.fixture";
import { NavigationContractFixture } from "./navigation-contract.fixture";
import * as sliderStories from "./slider.stories";

const { Default: DefaultSlider, Range: RangeSlider } = composeStories(sliderStories);

const meta = {
  title: "Local/Contracts",
  parameters: { layout: "padded" },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Form: Story = { render: () => <FormWorkflowContract /> };
export const InvalidForm: Story = { render: () => <FormWorkflowInvalidFixture /> };
export const Navigation: Story = { render: () => <NavigationContractFixture /> };
export const RTLSlider: Story = {
  render: () => (
    <DirectionProvider direction="rtl">
      <div dir="rtl">
        <DefaultSlider />
      </div>
    </DirectionProvider>
  ),
};
export const RTLRange: Story = {
  render: () => (
    <DirectionProvider direction="rtl">
      <div dir="rtl">
        <RangeSlider />
      </div>
    </DirectionProvider>
  ),
};
