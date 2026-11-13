// Modified: native UI SDK focus/hover Trigger, Portal/Positioner/Popup/Arrow.
import { Card, GlassButton, Tooltip } from "@lenso/ui";
import type { Meta } from "@storybook/react-vite";
import * as stylex from "@stylexjs/stylex";
import { position, positionControls, type OverlayPositionArgs } from "./overlay-position.fixtures";
import { OverlayIcon } from "./overlay.fixtures";
import { overlayStyles as s } from "./overlay.stylex";
type Args = OverlayPositionArgs & { showArrow?: boolean };
export default {
  argTypes: positionControls,
  component: Tooltip,
  parameters: { layout: "centered" },
  title: "Components/Overlays/Tooltip",
} as Meta<Args>;
const defaultArgs: Args = { showArrow: true };

function Template(props: Args) {
  return (
    <div {...stylex.props(s.compactRow)}>
      <Tooltip.Root delay={0}>
        <Tooltip.Trigger
          render={<GlassButton isIconOnly aria-label="Information" variant="default" />}
        >
          <OverlayIcon name="circle-info" />
        </Tooltip.Trigger>
        <Tooltip.Content {...position(props)}>
          {props.showArrow && <Tooltip.Arrow />}
          <p>Tooltip content</p>
        </Tooltip.Content>
      </Tooltip.Root>
    </div>
  );
}
function TemplateWithTrigger(props: Args) {
  return (
    <div {...stylex.props(s.compactRow)}>
      <Tooltip.Root delay={0}>
        <Tooltip.Trigger aria-label="Tooltip trigger">
          <div {...stylex.props(s.tooltipTrigger)}>
            <OverlayIcon name="circle-info" />
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content {...position(props)}>
          {props.showArrow && <Tooltip.Arrow />}
          <p>Tooltip content</p>
        </Tooltip.Content>
      </Tooltip.Root>
    </div>
  );
}
export const Default = { args: defaultArgs, render: Template };
export const WithTrigger = { args: defaultArgs, render: TemplateWithTrigger };
function CardWithTooltipTemplate(props: Args) {
  return (
    <Card xstyle={s.card200}>
      <Card.Content xstyle={s.cardTooltip}>
        <Tooltip.Root delay={0}>
          <Tooltip.Trigger
            aria-label="Attach a file"
            render={
              <GlassButton
                isIconOnly
                aria-label="Attach file"
                xstyle={s.round}
                size="lg"
                variant="default"
              />
            }
          >
            <OverlayIcon name="paperclip" />
          </Tooltip.Trigger>
          <Tooltip.Content {...position(props)}>
            {props.showArrow && <Tooltip.Arrow />}
            <p>Attach a file</p>
          </Tooltip.Content>
        </Tooltip.Root>
      </Card.Content>
    </Card>
  );
}
export const CardWithTooltip = { args: defaultArgs, render: CardWithTooltipTemplate };
