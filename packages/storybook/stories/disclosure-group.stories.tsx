// Adapted from HeroUI e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e, Apache-2.0.
// HeroUI Native text is reference content, not a Lenso architecture claim.
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Disclosure,
  DisclosureGroup,
  Separator,
  type DisclosureGroupRootProps,
} from "@lenso/ui";
import { Fragment, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { navigation as s } from "./navigation.stylex";
import { NavigationIcon } from "./navigation-icons";
import { productItems } from "./navigation-assets";
type SourceArgs = DisclosureGroupRootProps & {
  allowsMultipleExpanded?: boolean;
  isDisabled?: boolean;
};
const meta = {
  argTypes: {
    isDisabled: { control: { type: "boolean" } },
    allowsMultipleExpanded: { control: { type: "boolean" } },
  },
  component: DisclosureGroup,
  parameters: { layout: "centered" },
  title: "Components/Navigation/DisclosureGroup",
} satisfies Meta<SourceArgs>;
export default meta;
type Story = StoryObj<SourceArgs>;
const defaultArgs = { isDisabled: false, allowsMultipleExpanded: false };
function Navigation({
  value,
  ids,
  onChange,
  apple = false,
}: {
  value: string[];
  ids: string[];
  onChange: (value: string[]) => void;
  apple?: boolean;
}) {
  const index = ids.findIndex((id) => value.includes(id));
  const currentIndex = index < 0 ? 0 : index;
  return (
    <div {...stylex.props(apple ? s.appleNavigation : s.smallRow)}>
      <Button
        aria-label="Previous disclosure"
        disabled={currentIndex <= 0}
        size={apple ? "md" : "sm"}
        isIconOnly={apple}
        xstyle={apple && s.round}
        variant="secondary"
        onClick={() => onChange([ids[currentIndex - 1]!])}
      >
        {apple ? (
          <svg width="32" height="32" fill="currentColor" viewBox="0 0 36 36" aria-hidden="true">
            <path d="m11 20c0-.3838.1465-.7676.4395-1.0605l5.5-5.5c.5854-.5859 1.5356-.5859 2.1211 0l5.5 5.5c.5859.5859.5859 1.5352 0 2.1211-.5854.5859-1.5356.5859-2.1211 0l-4.4395-4.4395-4.4395 4.4395c-.5854.5859-1.5356.5859-2.1211 0-.293-.293-.4395-.6768-.4395-1.0605z" />
          </svg>
        ) : (
          <NavigationIcon icon="lucide:chevron-up" />
        )}
      </Button>
      <Button
        aria-label="Next disclosure"
        disabled={currentIndex >= ids.length - 1}
        size={apple ? "md" : "sm"}
        isIconOnly={apple}
        xstyle={apple && s.round}
        variant="secondary"
        onClick={() => onChange([ids[currentIndex + 1]!])}
      >
        {apple ? (
          <svg width="32" height="32" fill="currentColor" viewBox="0 0 36 36" aria-hidden="true">
            <path d="m19.0625 22.5597 5.5-5.5076c.5854-.5854.5825-1.5323-.0039-2.1157-.5869-.5835-1.5366-.5815-2.1211.0039l-4.4375 4.4438-4.4375-4.4438c-.5845-.5854-1.5342-.5874-2.1211-.0039-.2944.2922-.4414.676-.4414 1.0598 0 .3818.1455.7637.4375 1.0559l5.5 5.5076c.2813.2815.6636.4403 1.0625.4403s.7812-.1588 1.0625-.4403z" />
          </svg>
        ) : (
          <NavigationIcon icon="lucide:chevron-down" />
        )}
      </Button>
    </div>
  );
}
function Template({
  controlled = false,
  allowsMultipleExpanded,
  isDisabled,
  ...props
}: SourceArgs & { controlled?: boolean }) {
  const [value, setValue] = useState<string[]>(["preview"]);
  const ids = ["preview", "download"];
  return (
    <div {...stylex.props(s.width)}>
      <div {...stylex.props(s.surface)}>
        {controlled && (
          <div {...stylex.props(s.between)}>
            <h3 {...stylex.props(s.heading)}>HeroUI Native</h3>
            <Navigation value={value} ids={ids} onChange={setValue} />
          </div>
        )}
        <DisclosureGroup
          {...props}
          multiple={allowsMultipleExpanded}
          disabled={isDisabled}
          value={value}
          onValueChange={setValue}
        >
          {ids.map((id, index) => (
            <Fragment key={id}>
              {index > 0 && <Separator />}
              <Disclosure
                value={id}
                aria-label={id === "preview" ? "Preview HeroUI Native" : undefined}
              >
                <Disclosure.Heading
                  aria-label={id === "download" ? "Download HeroUI Native" : undefined}
                >
                  <Disclosure.Trigger
                    render={
                      <Button
                        variant={value.includes(id) ? "secondary" : "tertiary"}
                        xstyle={s.groupTrigger}
                      />
                    }
                  >
                    <span {...stylex.props(s.label)}>
                      <NavigationIcon
                        icon={id === "preview" ? "gravity-ui:qr-code" : "tabler:brand-apple-filled"}
                      />
                      {id === "preview" ? "Preview HeroUI Native" : "Download HeroUI Native"}
                    </span>
                    <Disclosure.Indicator />
                  </Disclosure.Trigger>
                </Disclosure.Heading>
                <Disclosure.Content>
                  <Disclosure.Body xstyle={s.qrBody}>
                    <p {...stylex.props(s.muted)}>
                      Scan this QR code with your camera app to preview the HeroUI native
                      components.
                    </p>
                    <img
                      alt="Expo Go QR Code"
                      {...stylex.props(s.qr)}
                      src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/images/qr-code-native.png"
                    />
                    <p {...stylex.props(s.muted)}>Expo must be installed on your device.</p>
                    <Button xstyle={s.action} variant="primary">
                      <NavigationIcon
                        icon={id === "preview" ? "logos:expo-icon" : "tabler:brand-apple-filled"}
                      />
                      {id === "preview" ? "Preview on Expo Go" : "Download on App Store"}
                    </Button>
                  </Disclosure.Body>
                </Disclosure.Content>
              </Disclosure>
            </Fragment>
          ))}
        </DisclosureGroup>
      </div>
    </div>
  );
}
function ShowcaseTemplate({ allowsMultipleExpanded, isDisabled, ...props }: SourceArgs) {
  const [value, setValue] = useState<string[]>(["colors"]);
  const ids = productItems.map((item) => item.id);
  return (
    <section {...stylex.props(s.appleSection)}>
      <div {...stylex.props(s.appleLeft)}>
        <div data-expanded={value.length > 0} {...stylex.props(s.appleControls)}>
          <Navigation value={value} ids={ids} onChange={setValue} apple />
        </div>
        <div {...stylex.props(s.appleDisclosure)}>
          <DisclosureGroup
            {...props}
            multiple={allowsMultipleExpanded}
            disabled={isDisabled}
            xstyle={s.appleGroup}
            value={value}
            onValueChange={setValue}
          >
            {productItems.map((item) => (
              <Disclosure key={item.id} value={item.id} aria-label={item.label}>
                <Disclosure.Heading>
                  <Disclosure.Trigger
                    render={
                      <Button
                        xstyle={[s.appleButton, value.includes(item.id) && s.appleSelected]}
                      />
                    }
                  >
                    <span {...stylex.props(s.label)}>
                      {item.id === "colors" ? (
                        <span {...stylex.props(s.swatch)}>
                          <span {...stylex.props(s.srOnly)}>Copy Cosmic Orange color</span>
                        </span>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                          <circle cx="12" cy="12" fill="none" r="11.3" stroke="currentColor" />
                          <g fill="currentColor" stroke="none" transform="translate(7 7)">
                            <path d="m9 4h-3v-3c0-.553-.447-1-1-1s-1 .447-1 1v3h-3c-.553 0-1 .447-1 1s.447 1 1 1h3v3c0 .553.447 1 1 1s1-.447 1-1v-3h3c.553 0 1-.447 1-1s-.447-1-1-1" />
                          </g>
                        </svg>
                      )}
                      {item.label}
                    </span>
                  </Disclosure.Trigger>
                </Disclosure.Heading>
                <Disclosure.Content>
                  <Disclosure.Body data-expanded={value.includes(item.id)} xstyle={s.appleBody}>
                    <p data-expanded={value.includes(item.id)} {...stylex.props(s.appleText)}>
                      <strong>{item.label}</strong>.&nbsp;{item.content}
                    </p>
                  </Disclosure.Body>
                </Disclosure.Content>
              </Disclosure>
            ))}
          </DisclosureGroup>
        </div>
      </div>
      {productItems.map((item) => (
        <img
          key={item.id}
          alt={item.label}
          data-selected={value.includes(item.id)}
          src={item.imgSrc}
          {...stylex.props(s.appleImage)}
        />
      ))}
    </section>
  );
}
export const Default: Story = { args: defaultArgs, render: (props) => <Template {...props} /> };
export const Controlled: Story = {
  args: defaultArgs,
  render: (props) => <Template {...props} controlled />,
};
export const Showcase1: Story = {
  args: { children: null },
  render: ShowcaseTemplate,
  name: "Showcases/Apple iPhone 17 Pro Disclosure Group",
};
