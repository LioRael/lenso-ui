"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
// oxlint-disable jsx-a11y/prefer-tag-over-role -- A named SVG needs img semantics; an HTML img cannot render this icon.
import { CircleDollar } from "@gravity-ui/icons";
import { Avatar, Button, Card, CloseButton, Link } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "./display.stylex";

const DOCS = "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/";
const AVATARS = "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/";

export function WithImages() {
  return (
    <div {...stylex.props(s.gridOuter)}>
      <div {...stylex.props(s.grid)}>
        <Card xstyle={s.firstCard}>
          <div {...stylex.props(s.imageFrame)}>
            <img
              alt="Cherries"
              {...stylex.props(s.imageZoom)}
              loading="lazy"
              src={`${DOCS}cherries.jpeg`}
            />
          </div>
          <div {...stylex.props(s.flexContent)}>
            <Card.Header xstyle={s.gap1}>
              <Card.Title xstyle={s.titleInset}>Become an ACME Creator!</Card.Title>
              <Card.Description>
                Lorem ipsum dolor sit amet consectetur. Sed arcu donec id aliquam dolor sed amet
                faucibus etiam.
              </Card.Description>
              <CloseButton aria-label="Close banner" xstyle={s.close} />
            </Card.Header>
            <Card.Footer xstyle={s.footer}>
              <div {...stylex.props(s.column)}>
                <span {...stylex.props(s.textSm, s.medium, s.foreground)}>Only 10 spots</span>
                <span {...stylex.props(s.textXs, s.muted)}>Submission ends Oct 10.</span>
              </div>
              <Button xstyle={s.fullAuto}>Apply Now</Button>
            </Card.Footer>
          </div>
        </Card>
        <div {...stylex.props(s.gridRow)}>
          <div {...stylex.props(s.gridHalf)}>
            <Card xstyle={s.span12}>
              <div {...stylex.props(s.close, s.z10)}>
                <CloseButton aria-label="Close notification" />
              </div>
              <Card.Header xstyle={s.gap3}>
                <CircleDollar
                  aria-label="Dollar sign icon"
                  {...stylex.props(s.primary, s.icon8, s.shrink0)}
                  role="img"
                />
                <div {...stylex.props(s.column1)}>
                  <span {...stylex.props(s.textXs, s.medium, s.muted, s.uppercase)}>PAYMENT</span>
                  <Card.Title xstyle={s.responsiveTitle}>You can now withdraw on crypto</Card.Title>
                  <Card.Description xstyle={s.responsiveXs}>
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
            <div {...stylex.props(s.gridRow)}>
              <Card xstyle={s.smallCard}>
                <Card.Header>
                  <Avatar xstyle={s.roundedAvatar}>
                    <Avatar.Image alt="Demo 1" src={`${DOCS}demo1.jpg`} />
                    <Avatar.Fallback>JK</Avatar.Fallback>
                  </Avatar>
                </Card.Header>
                <Card.Content xstyle={s.mt1}>
                  <p {...stylex.props(s.textSm, s.leading4, s.medium)}>Indie Hackers</p>
                  <p {...stylex.props(s.textXs, s.muted)}>148 members</p>
                </Card.Content>
                <Card.Footer xstyle={s.row2}>
                  <Avatar xstyle={s.avatarMini}>
                    <Avatar.Image alt="John" src={`${AVATARS}red.jpg`} />
                    <Avatar.Fallback>JK</Avatar.Fallback>
                  </Avatar>
                  <p {...stylex.props(s.textXs, s.muted)}>By John</p>
                </Card.Footer>
              </Card>
              <Card xstyle={s.smallCard}>
                <Card.Header>
                  <Avatar xstyle={s.roundedAvatar}>
                    <Avatar.Image alt="Demo 2" src={`${DOCS}demo2.jpg`} />
                    <Avatar.Fallback>AB</Avatar.Fallback>
                  </Avatar>
                </Card.Header>
                <Card.Content xstyle={s.mt1}>
                  <p {...stylex.props(s.textSm, s.leading4, s.medium)}>AI Builders</p>
                  <p {...stylex.props(s.textXs, s.muted)}>362 members</p>
                </Card.Content>
                <Card.Footer xstyle={s.row2}>
                  <Avatar xstyle={s.avatarMini}>
                    <Avatar.Image alt="John" src={`${AVATARS}blue.jpg`} />
                    <Avatar.Fallback>M</Avatar.Fallback>
                  </Avatar>
                  <p {...stylex.props(s.textXs, s.muted)}>By Martha</p>
                </Card.Footer>
              </Card>
            </div>
          </div>
          <Card xstyle={s.robotCard}>
            <img
              alt="NEO Home Robot"
              aria-hidden="true"
              {...stylex.props(s.imageCover)}
              src={`${DOCS}neo2.jpeg`}
            />
            <Card.Header xstyle={[s.z10, s.white]}>
              <Card.Title xstyle={[s.textXs, s.semibold, s.tracking, s.black70]}>NEO</Card.Title>
              <Card.Description xstyle={[s.textSm, s.medium, s.black50]}>
                Home Robot
              </Card.Description>
            </Card.Header>
            <Card.Footer xstyle={s.robotFooter}>
              <div>
                <div {...stylex.props(s.textSm, s.medium, s.black)}>Available soon</div>
                <div {...stylex.props(s.textXs, s.black60)}>Get notified</div>
              </div>
              <Button xstyle={s.whiteButton} size="sm" variant="tertiary">
                Notify me
              </Button>
            </Card.Footer>
          </Card>
        </div>
        <div {...stylex.props(s.gridRow)}>
          <Card xstyle={s.robotLarge}>
            <img
              alt="NEO Home Robot"
              aria-hidden="true"
              {...stylex.props(s.imageCover)}
              src={`${DOCS}neo1.jpeg`}
            />
            <Card.Footer xstyle={s.robotLargeFooter}>
              <div>
                <div {...stylex.props(s.responsiveBase, s.medium, s.black)}>NEO</div>
                <div {...stylex.props(s.responsiveXs, s.medium, s.black50)}>$499/m</div>
              </div>
              <Button xstyle={s.whiteButton} size="sm" variant="tertiary">
                Get now
              </Button>
            </Card.Footer>
          </Card>
          <div {...stylex.props(s.robotStack)}>
            <Card xstyle={s.eventCard} variant="transparent">
              <img
                alt="Futuristic Robot"
                {...stylex.props(s.eventImage)}
                loading="lazy"
                src={`${DOCS}robot1.jpeg`}
              />
              <div {...stylex.props(s.eventContent)}>
                <Card.Title xstyle={s.textSm}>Bridging the Future</Card.Title>
                <Card.Description xstyle={s.textXs}>Today, 6:30 PM</Card.Description>
              </div>
            </Card>
            <Card xstyle={s.eventCard} variant="transparent">
              <img
                alt="Avocado"
                {...stylex.props(s.eventImage)}
                loading="lazy"
                src={`${DOCS}avocado.jpeg`}
              />
              <div {...stylex.props(s.eventContent)}>
                <Card.Title xstyle={s.textSm}>Avocado Hackathon</Card.Title>
                <Card.Description xstyle={s.textXs}>Wed, 4:30 PM</Card.Description>
              </div>
            </Card>
            <Card xstyle={s.eventCard} variant="transparent">
              <img
                alt="Sound Electro event"
                {...stylex.props(s.eventImage)}
                loading="lazy"
                src={`${DOCS}oranges.jpeg`}
              />
              <div {...stylex.props(s.eventContent)}>
                <Card.Title xstyle={s.textSm}>Sound Electro | Beyond art</Card.Title>
                <Card.Description xstyle={s.textXs}>Fri, 8:00 PM</Card.Description>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
