// Modified: native Base UI focus/hover Trigger, Portal/Positioner/Popup/Arrow.
import type { Meta } from "@storybook/react-vite";
import * as stylex from "@stylexjs/stylex";
import { GlassButton, Card, Tooltip } from "@lenso/ui";
import { overlayStyles as s } from "./overlay.stylex";
import { OverlayIcon } from "./overlay.fixtures";
import { position, positionControls, type OverlayPositionArgs } from "./overlay-position.fixtures";
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
      <Tooltip.Root>
        <Tooltip.Trigger
          delay={0}
          render={<GlassButton isIconOnly aria-label="Information" variant="default" />}
        >
          <OverlayIcon name="circle-info" />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner {...position({ placement: "top", ...props })}>
            <Tooltip.Popup>
              {props.showArrow && <Tooltip.Arrow />}
              <p>Tooltip content</p>
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </div>
  );
}
function TemplateWithTrigger(props: Args) {
  return (
    <div {...stylex.props(s.compactRow)}>
      <Tooltip.Root>
        <Tooltip.Trigger delay={0} aria-label="Tooltip trigger">
          <div {...stylex.props(s.tooltipTrigger)}>
            <OverlayIcon name="circle-info" />
          </div>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner {...position({ placement: "top", ...props })}>
            <Tooltip.Popup>
              {props.showArrow && <Tooltip.Arrow />}
              <p>Tooltip content</p>
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
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
        <Tooltip.Root>
          <Tooltip.Trigger
            delay={0}
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
          <Tooltip.Portal>
            <Tooltip.Positioner {...position({ placement: "top", ...props })}>
              <Tooltip.Popup>
                {props.showArrow && <Tooltip.Arrow />}
                <p>Attach a file</p>
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Card.Content>
    </Card>
  );
}
export const CardWithTooltip = { args: defaultArgs, render: CardWithTooltipTemplate };
