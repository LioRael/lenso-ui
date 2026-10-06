"use client";

/**
 * Adapted from HeroUI v3.2.6 apps/docs/src/components/demo/index.tsx and its
 * sixteen demo helpers, plus the original English demo dictionary.
 * Copyright 2025 NextUI Inc.
 * Source: e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e. SPDX-License-Identifier: Apache-2.0.
 * Modified: StyleX presentation and current Lenso native interaction contracts.
 * Account, billing, file and save actions are sample content, not product workflows.
 */
import * as stylex from "@stylexjs/stylex";
import { Fragment, useId } from "react";
import {
  Comment,
  Envelope,
  FloppyDisk,
  Pencil,
  Person,
  SquarePlus,
  TrashBin,
} from "@gravity-ui/icons";
import {
  Alert,
  Avatar,
  AvatarGroup,
  Button,
  Card,
  Checkbox,
  CloseButton,
  Description,
  FieldError,
  Header,
  Input,
  InputOTP,
  Kbd,
  Label,
  Link,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  Radio,
  RadioGroup,
  Select,
  Separator,
  Slider,
  Spinner,
  Surface,
  Switch,
  Tabs,
  TextField,
} from "@lenso/ui";
import { preview as s } from "@/styles/theme-builder-preview.stylex";

const assetRoot = "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com";
const states = ["Florida", "Delaware", "California", "Texas", "New York", "Washington"];
const avatars = [
  { id: "blue-primary", color: "blue" },
  { id: "green", color: "green" },
  { id: "purple", color: "purple" },
  { id: "orange", color: "orange" },
  { id: "red", color: "red" },
  { id: "blue-secondary", color: "blue" },
  { id: "black", color: "black" },
];
const actions = [
  {
    key: "new-file",
    label: "New file",
    description: "Create a new file",
    icon: SquarePlus,
    shortcut: "N",
  },
  {
    key: "edit-file",
    label: "Edit file",
    description: "Make changes",
    icon: Pencil,
    shortcut: "E",
  },
  {
    key: "delete-file",
    label: "Delete file",
    description: "Move to trash",
    icon: TrashBin,
    shortcut: "D",
  },
] as const;

function StateSelect() {
  return (
    <TextField name="preview-state" xstyle={[s.width256, s.field]}>
      <Label required>State</Label>
      <Select required items={states.map((label) => ({ value: label, label }))}>
        <Select.Trigger xstyle={s.full}>
          <Select.Value placeholder="Select one" />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner>
            <Select.Popover>
              <Select.List>
                {states.map((state) => (
                  <Select.Item key={state} value={state}>
                    <Select.ItemText>{state}</Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popover>
          </Select.Positioner>
        </Select.Portal>
      </Select>
    </TextField>
  );
}

function Controls() {
  return (
    <div {...stylex.props(s.controls)}>
      <Checkbox defaultChecked aria-label="Checkbox Indicator Example">
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
      </Checkbox>
      <Switch defaultChecked aria-label="Switch On State Example">
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch>
      <RadioGroup
        aria-label="Radio Buttons Example"
        defaultValue="option2"
        name="preview-radio"
        xstyle={s.radios}
      >
        {["option1", "option2"].map((value) => (
          <Radio
            key={value}
            value={value}
            aria-label={value === "option1" ? "Option 1" : "Option 2"}
          >
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
          </Radio>
        ))}
      </RadioGroup>
      <Spinner />
    </div>
  );
}

function PreviewTabs() {
  return (
    <>
      <Tabs defaultValue="1d" xstyle={s.width256}>
        <Tabs.ListContainer>
          <Tabs.List aria-label="Time range">
            {["1D", "7D", "1M", "1Y", "All"].map((label) => (
              <Tabs.Tab key={label} value={label.toLowerCase()}>
                {label}
              </Tabs.Tab>
            ))}
            <Tabs.Indicator />
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>
      <Tabs defaultValue="chats" xstyle={s.width256}>
        <Tabs.ListContainer>
          <Tabs.List aria-label="Messages">
            <Tabs.Tab value="chats" xstyle={s.tab}>
              <Comment aria-hidden="true" />
              Chats
            </Tabs.Tab>
            <Tabs.Tab value="emails" xstyle={s.tab}>
              <Envelope aria-hidden="true" />
              Emails
            </Tabs.Tab>
            <Tabs.Indicator />
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>
    </>
  );
}

function ActionItem({ action }: { action: (typeof actions)[number] }) {
  const danger = action.key === "delete-file";
  const Icon = action.icon;
  return (
    <ListBoxItem
      itemKey={action.key}
      textValue={action.label}
      variant={danger ? "danger" : "default"}
    >
      <div {...stylex.props(s.actionIcon)}>
        <Icon aria-hidden="true" {...stylex.props(danger ? s.dangerIcon : s.mutedIcon)} />
      </div>
      <div {...stylex.props(s.actionCopy)}>
        <Label nativeLabel={false}>{action.label}</Label>
        <Description>{action.description}</Description>
      </div>
      <Kbd variant="light" xstyle={s.shortcut}>
        <Kbd.Abbr keyValue="command" />
        {danger && <Kbd.Abbr keyValue="shift" />}
        <Kbd.Content>{action.shortcut}</Kbd.Content>
      </Kbd>
    </ListBoxItem>
  );
}

function FileActions() {
  return (
    <Surface xstyle={s.actionSurface}>
      <ListBox aria-label="File actions" selectionMode="none" xstyle={s.actionList}>
        <ListBoxSection aria-label="Actions">
          <Header>Actions</Header>
          <ActionItem action={actions[0]} />
          <ActionItem action={actions[1]} />
        </ListBoxSection>
        <Separator aria-hidden="true" />
        <ListBoxSection aria-label="Danger zone">
          <Header>Danger zone</Header>
          <ActionItem action={actions[2]} />
        </ListBoxSection>
      </ListBox>
    </Surface>
  );
}

function VerifyAccount() {
  return (
    <div {...stylex.props(s.centerRow)}>
      <div {...stylex.props(s.otp)}>
        <div {...stylex.props(s.otpHeading)}>
          <Label nativeLabel={false} id="preview-otp-label">
            Verify account
          </Label>
          <p id="preview-otp-description" {...stylex.props(s.text, s.muted)}>
            We've sent a code to a****@gmail.com
          </p>
        </div>
        <InputOTP
          length={6}
          defaultValue="4320"
          aria-labelledby="preview-otp-label"
          aria-describedby="preview-otp-description"
        >
          <InputOTP.Group>
            {[0, 1, 2].map((index) => (
              <InputOTP.Slot key={index} aria-labelledby="preview-otp-label" />
            ))}
          </InputOTP.Group>
          <InputOTP.Separator />
          <InputOTP.Group>
            {[3, 4, 5].map((index) => (
              <InputOTP.Slot key={index} aria-label={`Digit ${index + 1}`} />
            ))}
          </InputOTP.Group>
        </InputOTP>
        <div {...stylex.props(s.resend)}>
          <p {...stylex.props(s.text, s.muted)}>Didn't receive a code?</p>
          <Link render={<button type="button" aria-label="Resend code" />} xstyle={s.resendLink}>
            Resend
          </Link>
        </div>
      </div>
    </div>
  );
}

// The original source icon assets, adapted inline without Tailwind or new image files.
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M5.877 1.46a6.921 6.921 0 0 0 .474 13.224c1.159.3 2.373.312 3.539.038a6.248 6.248 0 0 0 2.833-1.472 6.28 6.28 0 0 0 1.75-2.872 8.125 8.125 0 0 0 .176-3.673h-6.51v2.7h3.77a3.25 3.25 0 0 1-1.385 2.136c-.46.304-.98.509-1.523.601a4.517 4.517 0 0 1-1.652 0 4.068 4.068 0 0 1-1.537-.67 4.299 4.299 0 0 1-1.586-2.124 4.189 4.189 0 0 1 0-2.694c.208-.613.551-1.17 1.005-1.631a4.066 4.066 0 0 1 4.096-1.07c.558.172 1.07.471 1.492.875.425-.423.849-.847 1.273-1.272.218-.228.457-.446.672-.68a6.693 6.693 0 0 0-2.227-1.374 7 7 0 0 0-4.66-.042Z"
        fill="#fff"
      />
      <path
        d="M5.877 1.46a7 7 0 0 1 4.66.04c.826.31 1.582.78 2.226 1.381-.219.234-.45.453-.672.68l-1.272 1.267a3.752 3.752 0 0 0-1.492-.875 4.066 4.066 0 0 0-4.098 1.065A4.293 4.293 0 0 0 4.225 6.65L1.958 4.894A6.949 6.949 0 0 1 5.877 1.46Z"
        fill="#E33629"
      />
      <path
        d="M1.356 6.633a6.89 6.89 0 0 1 .602-1.74l2.267 1.76a4.19 4.19 0 0 0 0 2.694c-.755.584-1.511 1.17-2.267 1.76a6.927 6.927 0 0 1-.602-4.474Z"
        fill="#F8BD00"
      />
      <path
        d="M8.139 6.704h6.51a8.127 8.127 0 0 1-.176 3.673 6.283 6.283 0 0 1-1.75 2.872c-.732-.571-1.467-1.138-2.199-1.709a3.25 3.25 0 0 0 1.385-2.137h-3.77v-2.7Z"
        fill="#587DBD"
      />
      <path
        d="M1.957 11.106a539.69 539.69 0 0 0 2.267-1.759 4.298 4.298 0 0 0 1.588 2.125c.462.326.987.552 1.54.665a4.517 4.517 0 0 0 1.652 0 3.96 3.96 0 0 0 1.524-.602c.731.57 1.466 1.137 2.198 1.708a6.25 6.25 0 0 1-2.833 1.474 7.394 7.394 0 0 1-3.54-.039 6.967 6.967 0 0 1-4.397-3.572Z"
        fill="#319F43"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M11.367 13.52c-.654.633-1.367.533-2.054.233-.726-.306-1.393-.32-2.16 0-.96.414-1.466.294-2.04-.233-3.253-3.353-2.773-8.46.92-8.647.9.047 1.527.494 2.054.534.786-.16 1.54-.62 2.38-.56 1.006.08 1.766.48 2.266 1.2-2.08 1.246-1.586 3.986.32 4.753-.38 1-.873 1.993-1.693 2.727l.007-.007ZM8.02 4.833C7.92 3.347 9.127 2.12 10.513 2c.194 1.72-1.56 3-2.493 2.833Z"
        fill="currentColor"
      />
    </svg>
  );
}

function VerifiedBadge() {
  const id = useId();
  const gradientId = `preview-verified-gradient-${id}`;
  const filterId = `preview-verified-filter-${id}`;
  const outline =
    "M13.9844 3.40625L14.2471 3.65625L14.6055 3.60645L18.0098 3.13281L18.5977 6.48145L18.6611 6.84375L18.9873 7.01562L22.0059 8.60156L20.4941 11.6963L20.332 12.0283L20.4961 12.3594L22.002 15.3994L18.9873 16.9844L18.6611 17.1562L18.5977 17.5186L18.0098 20.8662L14.6055 20.3936L14.2471 20.3438L13.9844 20.5938L11.5 22.9629L9.01562 20.5938L8.75293 20.3438L8.39453 20.3936L4.98926 20.8662L4.40234 17.5186L4.33887 17.1562L4.0127 16.9844L0.99707 15.3994L2.50391 12.3594L2.66797 12.0283L2.50586 11.6963L0.993164 8.60156L4.0127 7.01562L4.33887 6.84375L4.40234 6.48145L4.98926 3.13281L8.39453 3.60645L8.75293 3.65625L9.01562 3.40625L11.5 1.03613L13.9844 3.40625Z";
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={outline} fill={`url(#${gradientId})`} />
      <path d={outline} stroke="#D4D4D8" strokeWidth="1.5" {...stylex.props(s.badgeStroke)} />
      <g filter={`url(#${filterId})`}>
        <path
          d="M6 12.3279L9.76623 16L16 9.35519L14.5281 8L9.67965 13.1585L7.42857 10.929L6 12.3279Z"
          fill="#F4F4F5"
        />
      </g>
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="10.1"
          id={filterId}
          width="10"
          x="6"
          y="8"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          {[0.3, 0.6, 0.9, 1.2, 1.5, 1.8, 2.1].map((offset, index) => (
            <Fragment key={offset}>
              <feColorMatrix
                in="SourceAlpha"
                result="hardAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              />
              <feOffset dy={offset} />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix
                type="matrix"
                values={
                  index === 0
                    ? "0 0 0 0 0.785986 0 0 0 0 0.532335 0 0 0 0 0.21662 0 0 0 1 0"
                    : "0 0 0 0 0.784314 0 0 0 0 0.533333 0 0 0 0 0.215686 0 0 0 1 0"
                }
              />
              <feBlend
                in2={index === 0 ? "BackgroundImageFix" : `shadow-${index}`}
                mode="normal"
                result={`shadow-${index + 1}`}
              />
            </Fragment>
          ))}
          <feBlend in="SourceGraphic" in2="shadow-7" mode="normal" result="shape" />
        </filter>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={gradientId}
          x1="6"
          x2="16.5"
          y1="1"
          y2="25"
        >
          <stop stopColor="#F1DF76" />
          <stop offset="0.0001" stopColor="#FFEF8F" />
          <stop offset="0.479167" stopColor="#EECA37" />
          <stop offset="1" stopColor="#DEB200" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SocialProfile() {
  return (
    <Card xstyle={s.profile}>
      <Card.Header xstyle={s.profileHeader}>
        <div {...stylex.props(s.profileIdentity)}>
          <Avatar size="sm">
            <Avatar.Image alt="HeroUI" src={`${assetRoot}/docs/heroui_isotipo.png`} />
            <Avatar.Fallback>H</Avatar.Fallback>
          </Avatar>
          <div>
            <div {...stylex.props(s.profileName)}>
              <span {...stylex.props(s.text, s.semibold, s.name)}>HeroUI</span>
              <VerifiedBadge />
            </div>
            <span {...stylex.props(s.text, s.muted, s.profileHandle)}>@hero_ui</span>
          </div>
        </div>
      </Card.Header>
      <Card.Content xstyle={s.profileContent}>
        <p {...stylex.props(s.text, s.medium, s.bio)}>
          Building the future of UI for web & mobile.&nbsp;
          <br />
          <span>🚀</span>&nbsp;(YC S24)&nbsp;
        </p>
      </Card.Content>
      <Card.Footer xstyle={s.footer}>
        <div {...stylex.props(s.stat)}>
          <p {...stylex.props(s.text, s.semibold)}>4</p>
          <p {...stylex.props(s.text, s.muted)}>Following</p>
        </div>
        <div {...stylex.props(s.stat)}>
          <p {...stylex.props(s.text, s.semibold)}>97.1K</p>
          <p {...stylex.props(s.text, s.muted)}>Followers</p>
        </div>
      </Card.Footer>
    </Card>
  );
}

function SignupCard() {
  return (
    <Card xstyle={s.signup}>
      <Card.Header xstyle={s.signupHeader}>
        <Avatar>
          <Avatar.Fallback>
            <Person aria-hidden="true" />
          </Avatar.Fallback>
        </Avatar>
        <Card.Title>Create an account</Card.Title>
        <CloseButton aria-label="Close account example" xstyle={s.close} />
      </Card.Header>
      <Card.Content xstyle={s.signupContent}>
        <p {...stylex.props(s.text, s.medium, s.muted, s.trial)}>
          Start your free 7-day trial. No credit card required.
        </p>
        <Button xstyle={s.full}>Get Started</Button>
        <div {...stylex.props(s.divider)}>
          <Separator xstyle={s.separator} />
          <p {...stylex.props(s.text, s.small, s.medium, s.muted, s.or)}>Or</p>
          <Separator xstyle={s.separator} />
        </div>
        <Button variant="tertiary" xstyle={s.full}>
          <GoogleIcon />
          Continue with Google
        </Button>
        <Button variant="tertiary" xstyle={s.full}>
          <AppleIcon />
          Continue with Apple
        </Button>
      </Card.Content>
    </Card>
  );
}

function GroupCards() {
  return (
    <div {...stylex.props(s.groups)}>
      {[
        {
          title: "Indie Hackers",
          members: "148 members",
          by: "John",
          initials: "JK",
          image: "demo1.jpg",
          avatar: "red",
        },
        {
          title: "AI Builders",
          members: "362 members",
          by: "Martha",
          initials: "M",
          image: "demo2.jpg",
          avatar: "blue",
        },
      ].map((group) => (
        <Card key={group.title} xstyle={s.group}>
          <Card.Header>
            <Avatar xstyle={s.groupAvatar}>
              <Avatar.Image alt={group.title} src={`/assets/images/${group.image}`} />
              <Avatar.Fallback>{group.initials}</Avatar.Fallback>
            </Avatar>
          </Card.Header>
          <Card.Content xstyle={s.start}>
            <p {...stylex.props(s.text, s.medium)}>{group.title}</p>
            <p {...stylex.props(s.text, s.muted)}>{group.members}</p>
          </Card.Content>
          <Card.Footer xstyle={s.footer}>
            <Avatar xstyle={s.groupFooterAvatar}>
              <Avatar.Image alt={group.by} src={`${assetRoot}/avatars/${group.avatar}.jpg`} />
              <Avatar.Fallback>{group.initials}</Avatar.Fallback>
            </Avatar>
            <p {...stylex.props(s.text, s.small, s.muted)}>By {group.by}</p>
          </Card.Footer>
        </Card>
      ))}
    </div>
  );
}

function UnsavedCard() {
  return (
    <Card xstyle={s.unsaved}>
      <Card.Header xstyle={s.unsavedHeader}>
        <Avatar color="warning" variant="soft">
          <Avatar.Fallback>
            <FloppyDisk width={18} height={18} aria-hidden="true" />
          </Avatar.Fallback>
        </Avatar>
        <Card.Title>Unsaved changes</Card.Title>
        <Card.Description>Do you want to save or discard changes?</Card.Description>
        <CloseButton aria-label="Close unsaved changes example" xstyle={s.close} />
      </Card.Header>
      <Card.Footer xstyle={s.unsavedFooter}>
        <Button variant="tertiary" xstyle={s.full}>
          Discard
        </Button>
        <Button xstyle={s.full}>Save changes</Button>
      </Card.Footer>
    </Card>
  );
}

export function ThemeBuilderPreview() {
  return (
    <div data-demo-content="theme-builder-components" {...stylex.props(s.grid)}>
      <div {...stylex.props(s.column, s.left)}>
        <TextField name="preview-email" xstyle={s.start}>
          <Label required>Your email</Label>
          <Input type="email" required placeholder="john@email.com" xstyle={s.width256} />
          <Description xstyle={s.description}>We won't share your email</Description>
          <FieldError>The email is invalid</FieldError>
        </TextField>
        <StateSelect />
        <Controls />
        <div {...stylex.props(s.width256, s.slider)}>
          <Slider
            defaultValue={250}
            min={0}
            max={500}
            step={10}
            format={{ style: "currency", currency: "USD" }}
          >
            <Slider.Label>Price</Slider.Label>
            <Slider.Output />
            <Slider.Control>
              <Slider.Track>
                <Slider.Fill />
              </Slider.Track>
              <Slider.Thumb aria-label="Price" />
            </Slider.Control>
          </Slider>
        </div>
        <PreviewTabs />
        <FileActions />
      </div>
      <div {...stylex.props(s.column, s.center)}>
        <div {...stylex.props(s.centerRow)}>
          <AvatarGroup max={5}>
            {avatars.map(({ id, color }) => (
              <Avatar key={id}>
                <Avatar.Image alt={color} src={`${assetRoot}/avatars/${color}.jpg`} />
                <Avatar.Fallback>{color[0]?.toUpperCase()}</Avatar.Fallback>
              </Avatar>
            ))}
          </AvatarGroup>
        </div>
        <VerifyAccount />
        <div {...stylex.props(s.buttons)}>
          {(["primary", "secondary", "tertiary", "danger", "danger-soft", "ghost"] as const).map(
            (variant) => (
              <Button key={variant} size="sm" variant={variant}>
                Click me
              </Button>
            ),
          )}
        </div>
        <SocialProfile />
        <Alert xstyle={s.alert}>
          <Alert.Indicator />
          <Alert.Content xstyle={s.textStart}>
            <Alert.Title xstyle={s.alertTitle}>You have 2 credits left</Alert.Title>
            <Alert.Description xstyle={s.small}>Get a paid plan for more credits</Alert.Description>
          </Alert.Content>
          <Button variant="tertiary">Upgrade</Button>
        </Alert>
        <div {...stylex.props(s.centerRow)}>
          <Switch
            defaultChecked
            aria-label="Allow notifications"
            aria-describedby="preview-notifications-description"
            xstyle={s.notifications}
          >
            <Switch.Content xstyle={s.notificationCopy}>
              <span {...stylex.props(s.text, s.medium)}>Allow notifications</span>
              <Description id="preview-notifications-description">
                Receive push notifications from HeroUI
              </Description>
            </Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch>
        </div>
      </div>
      <div {...stylex.props(s.right)}>
        <div {...stylex.props(s.signupPlacement)}>
          <SignupCard />
        </div>
        <GroupCards />
        <UnsavedCard />
      </div>
    </div>
  );
}
