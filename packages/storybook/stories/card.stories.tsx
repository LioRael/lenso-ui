// Adapted from HeroUI v3.2.6 card.stories.tsx (Apache-2.0).
import type { Meta, StoryObj } from "@storybook/react-vite";
import * as stylex from "@stylexjs/stylex";
import { Card, Avatar, Button, CloseButton, Form, Input, Label, Link, TextField } from "@lenso/ui";
import { SourceIcon } from "./source-icons";

const styles = stylex.create({
  defaultCard: { width: 400 },
  icon: { color: "var(--accent)", width: 24, height: 24 },
  paymentIcon: { color: "var(--accent)", width: 32, height: 32, flexShrink: 0 },
  stack: { display: "flex", flexDirection: "column", gap: 16 },
  variant: { width: 320 },
  horizontal: {
    width: "100%",
    alignItems: "stretch",
    flexDirection: { default: "column", "@media (min-width: 768px)": "row" },
  },
  porsche: {
    pointerEvents: "none",
    aspectRatio: "1 / 1",
    width: "100%",
    borderRadius: 24,
    objectFit: "cover",
    userSelect: "none",
    maxWidth: { default: null, "@media (min-width: 768px)": 136 },
  },
  content: { display: "flex", flexGrow: 1, flexDirection: "column", gap: 12 },
  tight: { gap: 4 },
  horizontalFooter: {
    marginTop: "auto",
    display: "flex",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  column: { display: "flex", flexDirection: "column" },
  price: { fontSize: 14, fontWeight: 500, color: "var(--foreground)" },
  caption: { fontSize: 12, color: "var(--muted)" },
  avatarCards: { display: "flex", gap: 16 },
  community: { width: 200, gap: 8 },
  communityImage: {
    pointerEvents: "none",
    aspectRatio: "1 / 1",
    width: 56,
    borderRadius: 16,
    objectFit: "cover",
    userSelect: "none",
  },
  communityFooter: { display: "flex", gap: 8 },
  avatar: { width: 20, height: 20 },
  small: { fontSize: 12 },
  canvas: { display: "flex", width: "100%", alignItems: "center", justifyContent: "center" },
  grid: {
    display: "grid",
    width: "100%",
    maxWidth: 672,
    gridTemplateColumns: "repeat(12, 1fr)",
    gap: 16,
    padding: 16,
  },
  row: {
    gridColumn: "span 12 / span 12",
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)",
    gap: 16,
  },
  banner: {
    gridColumn: "span 12 / span 12",
    display: "flex",
    height: "auto",
    minHeight: 152,
    flexDirection: { default: "column", "@media (min-width: 640px)": "row" },
  },
  cherries: {
    position: "relative",
    height: { default: 140, "@media (min-width: 640px)": 120 },
    width: { default: "100%", "@media (min-width: 640px)": 120 },
    flexShrink: 0,
    overflow: "hidden",
    borderRadius: 16,
  },
  cover: { position: "absolute", inset: 0, height: "100%", width: "100%", objectFit: "cover" },
  zoom: { pointerEvents: "none", transform: "scale(1.25)", userSelect: "none" },
  titleRoom: { paddingInlineEnd: 32 },
  close: { position: "absolute", insetInlineEnd: 12, top: 12 },
  closeFront: { zIndex: 10 },
  bannerFooter: {
    marginTop: "auto",
    display: "flex",
    width: "100%",
    gap: 12,
    flexDirection: { default: "column", "@media (min-width: 640px)": "row" },
    alignItems: { default: "flex-start", "@media (min-width: 640px)": "center" },
    justifyContent: { default: null, "@media (min-width: 640px)": "space-between" },
  },
  apply: { width: { default: "100%", "@media (min-width: 640px)": "auto" } },
  paymentColumn: {
    gridColumn: { default: "span 12 / span 12", "@media (min-width: 1024px)": "span 6 / span 6" },
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)",
    gap: 16,
  },
  whole: { gridColumn: "span 12 / span 12" },
  paymentHeader: { gap: 12 },
  paymentContent: { display: "flex", flexDirection: "column", gap: 4 },
  paymentLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--muted)",
    textTransform: "uppercase",
  },
  paymentTitle: {
    paddingInlineEnd: 32,
    fontSize: { default: 14, "@media (min-width: 640px)": 16 },
  },
  paymentDescription: { fontSize: { default: 12, "@media (min-width: 640px)": 14 } },
  compactCommunity: {
    gridColumn: { default: "span 12 / span 12", "@media (min-width: 640px)": "span 6 / span 6" },
    gap: 8,
  },
  communityAvatar: { width: 56, height: 56, borderRadius: 12 },
  communityContent: { marginTop: 4 },
  communityTitle: { fontSize: 14, lineHeight: "16px", fontWeight: 500 },
  tinyAvatar: { width: 16, height: 16 },
  creator: { display: "flex", alignItems: "center", gap: 8 },
  robot: {
    gridColumn: { default: "span 12 / span 12", "@media (min-width: 1024px)": "span 6 / span 6" },
    minHeight: 200,
    borderRadius: 24,
  },
  robotHeader: { zIndex: 10, color: "white" },
  robotTitle: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.025em",
    color: "rgb(0 0 0 / 70%)",
  },
  robotDescription: {
    fontSize: 14,
    lineHeight: "20px",
    fontWeight: 500,
    color: "rgb(0 0 0 / 50%)",
  },
  bottom: {
    pointerEvents: "none",
    position: "absolute",
    insetInlineStart: 0,
    insetInlineEnd: 0,
    bottom: 0,
    height: 64,
  },
  tallerBottom: { height: { default: 64, "@media (min-width: 640px)": 80 } },
  blur: {
    position: "absolute",
    inset: 0,
    height: "100%",
    borderBottomLeftRadius: "inherit",
    borderBottomRightRadius: "inherit",
    backdropFilter: "blur(8px)",
    WebkitMaskImage: "linear-gradient(to top, black 30%, transparent)",
    maskImage: "linear-gradient(to top, black 30%, transparent)",
    maskRepeat: "no-repeat",
    maskSize: "100% 100%",
  },
  robotFooter: {
    zIndex: 10,
    marginTop: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  black: { fontSize: 14, fontWeight: 500, color: "black" },
  blackCaption: { fontSize: 12, color: "rgb(0 0 0 / 60%)" },
  whiteButton: { backgroundColor: "white", color: "black" },
  heroRobot: {
    position: "relative",
    gridColumn: { default: "span 12 / span 12", "@media (min-width: 768px)": "span 8 / span 8" },
    height: { default: 250, "@media (min-width: 640px)": 300, "@media (min-width: 768px)": 350 },
  },
  heroFooter: {
    zIndex: 10,
    marginTop: "auto",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  heroTitle: {
    fontSize: { default: 16, "@media (min-width: 640px)": 18 },
    fontWeight: 500,
    color: "black",
  },
  heroPrice: {
    fontSize: { default: 12, "@media (min-width: 640px)": 14 },
    fontWeight: 500,
    color: "rgb(0 0 0 / 50%)",
  },
  events: {
    gridColumn: { default: "span 12 / span 12", "@media (min-width: 768px)": "span 4 / span 4" },
    display: "flex",
    flexDirection: "column",
    gap: { default: 8, "@media (min-width: 768px)": 0 },
    justifyContent: { default: null, "@media (min-width: 768px)": "space-between" },
  },
  event: { display: "flex", flexDirection: "row", gap: 12, padding: 4 },
  eventImage: {
    aspectRatio: "1 / 1",
    width: { default: 64, "@media (min-width: 640px)": 80 },
    height: { default: 64, "@media (min-width: 640px)": 80 },
    flexShrink: 0,
    borderRadius: 12,
    objectFit: "cover",
    userSelect: "none",
  },
  eventContent: {
    display: "flex",
    flexGrow: 1,
    flexDirection: "column",
    justifyContent: "center",
    gap: 4,
  },
  eventTitle: { fontSize: 14 },
  form: { width: "100%", maxWidth: 448 },
  formFooter: { marginTop: 16, display: "flex", flexDirection: "column", gap: 8 },
  formButton: { width: "100%" },
  forgot: { textAlign: "center", fontSize: 14 },
});
const meta = {
  title: "Components/Layout/Card",
  component: Card,
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["transparent", "default", "secondary", "tertiary"],
    },
  },
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;
const asset = (path: string) => `https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/${path}`;
export const Default: Story = {
  render: (args) => (
    <Card {...args} xstyle={[styles.defaultCard, args.xstyle]}>
      <SourceIcon
        aria-label="Dollar sign icon"
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- Inline SVG retains currentColor and source vector geometry.
        role="img"
        name="circle-dollar"
        {...stylex.props(styles.icon)}
      />
      <Card.Header>
        <Card.Title>Become an Acme Creator!</Card.Title>
        <Card.Description>
          Visit the Acme Creator Hub to sign up today and start earning credits from your fans and
          followers.
        </Card.Description>
      </Card.Header>
      <Card.Footer>
        <Link
          aria-label="Go to Acme Creator Hub (opens in new tab)"
          href="https://heroui.com"
          rel="noopener noreferrer"
          target="_blank"
        >
          Creator Hub
          <Link.Icon aria-hidden="true" />
        </Link>
      </Card.Footer>
    </Card>
  ),
};
const variants = [
  {
    variant: "transparent",
    title: "Transparent",
    description: "Minimal prominence with transparent background",
    text: "Use for less important content or nested cards",
  },
  {
    variant: "default",
    title: "Default",
    description: "Standard card appearance (bg-surface)",
    text: "The default card variant for most use cases",
  },
  {
    variant: "secondary",
    title: "Secondary",
    description: "Medium prominence (bg-surface-secondary)",
    text: "Use to draw moderate attention",
  },
  {
    variant: "tertiary",
    title: "Tertiary",
    description: "Higher prominence (bg-surface-tertiary)",
    text: "Use for primary or featured content",
  },
] as const;
export const Variants: Story = {
  render: () => (
    <div {...stylex.props(styles.stack)}>
      {variants.map((item) => (
        <Card key={item.variant} variant={item.variant} xstyle={styles.variant}>
          <Card.Header>
            <Card.Title>{item.title}</Card.Title>
            <Card.Description>{item.description}</Card.Description>
          </Card.Header>
          <Card.Content>
            <p>{item.text}</p>
          </Card.Content>
        </Card>
      ))}
    </div>
  ),
};
export const Horizontal: Story = {
  render: (args) => (
    <Card {...args} xstyle={[styles.horizontal, args.xstyle]}>
      <img
        alt="Porsche 911 Golden Edition"
        {...stylex.props(styles.porsche)}
        loading="lazy"
        src={asset("components/card/porsche-911.png")}
      />
      <div {...stylex.props(styles.content)}>
        <Card.Header xstyle={styles.tight}>
          <Card.Title>Get the new Porsche 911 golden edition</Card.Title>
          <Card.Description>
            Experience unmatched luxury and performance with the Porsche 911 Golden Edition—where
            sleek design meets cutting-edge tech and pure driving thrill.
          </Card.Description>
        </Card.Header>
        <Card.Footer xstyle={styles.horizontalFooter}>
          <div {...stylex.props(styles.column)}>
            <span aria-label="Price: 36,799 US dollars" {...stylex.props(styles.price)}>
              $36,799
            </span>
            <span aria-label="Available stock: 11 units" {...stylex.props(styles.caption)}>
              11 available
            </span>
          </div>
          <Button>Buy Now</Button>
        </Card.Footer>
      </div>
    </Card>
  ),
};
export const WithAvatar: Story = {
  render: (args) => (
    <div {...stylex.props(styles.avatarCards)}>
      <Card {...args} xstyle={[styles.community, args.xstyle]}>
        <img
          alt="Indie Hackers community"
          {...stylex.props(styles.communityImage)}
          loading="lazy"
          src={asset("docs/demo1.jpg")}
        />
        <Card.Header>
          <Card.Title>Indie Hackers</Card.Title>
          <Card.Description>148 members</Card.Description>
        </Card.Header>
        <Card.Footer xstyle={styles.communityFooter}>
          <Avatar aria-label="Martha's profile picture" xstyle={styles.avatar}>
            <Avatar.Image alt="Martha's avatar" src={asset("avatars/red.jpg")} />
            <Avatar.Fallback xstyle={styles.small}>IH</Avatar.Fallback>
          </Avatar>
          <span {...stylex.props(styles.small)}>By Martha</span>
        </Card.Footer>
      </Card>
      <Card {...args} xstyle={[styles.community, args.xstyle]}>
        <img
          alt="AI Builders community"
          {...stylex.props(styles.communityImage)}
          loading="lazy"
          src={asset("docs/demo2.jpg")}
        />
        <Card.Header>
          <Card.Title>AI Builders</Card.Title>
          <Card.Description>362 members</Card.Description>
        </Card.Header>
        <Card.Footer xstyle={styles.communityFooter}>
          <Avatar aria-label="John's profile picture" xstyle={styles.avatar}>
            <Avatar.Image alt="John's avatar - blue themed" src={asset("avatars/blue.jpg")} />
            <Avatar.Fallback xstyle={styles.small}>B</Avatar.Fallback>
          </Avatar>
          <span {...stylex.props(styles.small)}>By John</span>
        </Card.Footer>
      </Card>
    </div>
  ),
};
const communities = [
  {
    image: "demo1.jpg",
    alt: "Demo 1",
    fallback: "JK",
    title: "Indie Hackers",
    members: "148 members",
    creatorImage: "red.jpg",
    creatorFallback: "JK",
    creator: "By John",
  },
  {
    image: "demo2.jpg",
    alt: "Demo 2",
    fallback: "AB",
    title: "AI Builders",
    members: "362 members",
    creatorImage: "blue.jpg",
    creatorFallback: "M",
    creator: "By Martha",
  },
];
const events = [
  {
    image: "robot1.jpeg",
    alt: "Futuristic Robot",
    title: "Bridging the Future",
    time: "Today, 6:30 PM",
  },
  { image: "avocado.jpeg", alt: "Avocado", title: "Avocado Hackathon", time: "Wed, 4:30 PM" },
  {
    image: "oranges.jpeg",
    alt: "Sound Electro event",
    title: "Sound Electro | Beyond art",
    time: "Fri, 8:00 PM",
  },
];
export const WithImages: Story = {
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <div {...stylex.props(styles.canvas)}>
      <div {...stylex.props(styles.grid)}>
        <Card {...args} xstyle={[styles.banner, args.xstyle]}>
          <div {...stylex.props(styles.cherries)}>
            <img
              alt="Cherries"
              {...stylex.props(styles.cover, styles.zoom)}
              loading="lazy"
              src={asset("docs/cherries.jpeg")}
            />
          </div>
          <div {...stylex.props(styles.content)}>
            <Card.Header xstyle={styles.tight}>
              <Card.Title xstyle={styles.titleRoom}>Become an ACME Creator!</Card.Title>
              <Card.Description>
                Lorem ipsum dolor sit amet consectetur. Sed arcu donec id aliquam dolor sed amet
                faucibus etiam.
              </Card.Description>
              <CloseButton aria-label="Close banner" xstyle={styles.close} />
            </Card.Header>
            <Card.Footer xstyle={styles.bannerFooter}>
              <div {...stylex.props(styles.column)}>
                <span {...stylex.props(styles.price)}>Only 10 spots</span>
                <span {...stylex.props(styles.caption)}>Submission ends Oct 10.</span>
              </div>
              <Button xstyle={styles.apply}>Apply Now</Button>
            </Card.Footer>
          </div>
        </Card>
        <div {...stylex.props(styles.row)}>
          <div {...stylex.props(styles.paymentColumn)}>
            <Card xstyle={styles.whole}>
              <div {...stylex.props(styles.close, styles.closeFront)}>
                <CloseButton aria-label="Close notification" />
              </div>
              <Card.Header xstyle={styles.paymentHeader}>
                <SourceIcon
                  aria-label="Dollar sign icon"
                  // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- Inline SVG retains currentColor and source vector geometry.
                  role="img"
                  name="circle-dollar"
                  {...stylex.props(styles.paymentIcon)}
                />
                <div {...stylex.props(styles.paymentContent)}>
                  <span {...stylex.props(styles.paymentLabel)}>PAYMENT</span>
                  <Card.Title xstyle={styles.paymentTitle}>
                    You can now withdraw on crypto
                  </Card.Title>
                  <Card.Description xstyle={styles.paymentDescription}>
                    Add your wallet in settings to withdraw
                  </Card.Description>
                </div>
              </Card.Header>
              <Card.Footer>
                <Link aria-label="Go to settings" href="#" rel="noopener noreferrer">
                  Go to settings
                  <Link.Icon aria-hidden="true" />
                </Link>
              </Card.Footer>
            </Card>
            <div {...stylex.props(styles.row)}>
              {communities.map((item) => (
                <Card key={item.title} xstyle={styles.compactCommunity}>
                  <Card.Header>
                    <Avatar xstyle={styles.communityAvatar}>
                      <Avatar.Image alt={item.alt} src={asset(`docs/${item.image}`)} />
                      <Avatar.Fallback>{item.fallback}</Avatar.Fallback>
                    </Avatar>
                  </Card.Header>
                  <Card.Content xstyle={styles.communityContent}>
                    <p {...stylex.props(styles.communityTitle)}>{item.title}</p>
                    <p {...stylex.props(styles.caption)}>{item.members}</p>
                  </Card.Content>
                  <Card.Footer xstyle={styles.creator}>
                    <Avatar xstyle={styles.tinyAvatar}>
                      <Avatar.Image alt="John" src={asset(`avatars/${item.creatorImage}`)} />
                      <Avatar.Fallback>{item.creatorFallback}</Avatar.Fallback>
                    </Avatar>
                    <p {...stylex.props(styles.caption)}>{item.creator}</p>
                  </Card.Footer>
                </Card>
              ))}
            </div>
          </div>
          <Card {...args} xstyle={[styles.robot, args.xstyle]}>
            <img
              alt="NEO Home Robot"
              aria-hidden="true"
              {...stylex.props(styles.cover)}
              src={asset("docs/neo2.jpeg")}
            />
            <Card.Header xstyle={styles.robotHeader}>
              <Card.Title xstyle={styles.robotTitle}>NEO</Card.Title>
              <Card.Description xstyle={styles.robotDescription}>Home Robot</Card.Description>
            </Card.Header>
            <div aria-hidden="true" {...stylex.props(styles.bottom)}>
              <div {...stylex.props(styles.blur)} />
            </div>
            <Card.Footer xstyle={styles.robotFooter}>
              <div>
                <div {...stylex.props(styles.black)}>Available soon</div>
                <div {...stylex.props(styles.blackCaption)}>Get notified</div>
              </div>
              <Button xstyle={styles.whiteButton} size="sm" variant="tertiary">
                Notify me
              </Button>
            </Card.Footer>
          </Card>
        </div>
        <div {...stylex.props(styles.row)}>
          <Card {...args} xstyle={[styles.heroRobot, args.xstyle]}>
            <img
              alt="NEO Home Robot"
              aria-hidden="true"
              {...stylex.props(styles.cover)}
              src={asset("docs/neo1.jpeg")}
            />
            <div aria-hidden="true" {...stylex.props(styles.bottom, styles.tallerBottom)}>
              <div {...stylex.props(styles.blur)} />
            </div>
            <Card.Footer xstyle={styles.heroFooter}>
              <div>
                <div {...stylex.props(styles.heroTitle)}>NEO</div>
                <div {...stylex.props(styles.heroPrice)}>$499/m</div>
              </div>
              <Button xstyle={styles.whiteButton} size="sm" variant="tertiary">
                Get now
              </Button>
            </Card.Footer>
          </Card>
          <div {...stylex.props(styles.events)}>
            {events.map((event) => (
              <Card key={event.title} xstyle={styles.event} variant="transparent">
                <img
                  alt={event.alt}
                  {...stylex.props(styles.eventImage)}
                  loading="lazy"
                  src={asset(`docs/${event.image}`)}
                />
                <div {...stylex.props(styles.eventContent)}>
                  <Card.Title xstyle={styles.eventTitle}>{event.title}</Card.Title>
                  <Card.Description xstyle={styles.small}>{event.time}</Card.Description>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
};
export const WithForm: Story = {
  render: (args) => (
    <Card {...args} xstyle={[styles.form, args.xstyle]}>
      <Card.Header>
        <Card.Title>Login</Card.Title>
        <Card.Description>Enter your credentials to access your account</Card.Description>
      </Card.Header>
      <Form
        onSubmit={(event) => {
          event.preventDefault();
          window.alert("Form submitted successfully!");
        }}
      >
        <Card.Content>
          <div {...stylex.props(styles.stack)}>
            <TextField name="email">
              <Label>Email</Label>
              <Input type="email" placeholder="email@example.com" variant="secondary" />
            </TextField>
            <TextField name="password">
              <Label>Password</Label>
              <Input type="password" placeholder="••••••••" variant="secondary" />
            </TextField>
          </div>
        </Card.Content>
        <Card.Footer xstyle={styles.formFooter}>
          <Button xstyle={styles.formButton} type="submit">
            Sign In
          </Button>
          <Link xstyle={styles.forgot} href="#">
            Forgot password?
          </Link>
        </Card.Footer>
      </Form>
    </Card>
  ),
};
