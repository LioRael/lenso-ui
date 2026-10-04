// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
// oxlint-disable jsx-a11y/prefer-tag-over-role -- A named SVG needs img semantics; an HTML img cannot render this icon.
import { CircleDollar } from "@gravity-ui/icons";
import { Avatar, Button, Card, CloseButton, Link } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../../en/card/display.stylex";
const DOCS = "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/";
const AVATARS = "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/";
export function WithImages() {
  return (
    <div {...stylex.props(s.gridOuter)}>
      <div {...stylex.props(s.grid)}>
        <Card xstyle={s.firstCard}>
          <div {...stylex.props(s.imageFrame)}>
            <img
              alt="樱桃"
              {...stylex.props(s.imageZoom)}
              loading="lazy"
              src={`${DOCS}cherries.jpeg`}
            />
          </div>
          <div {...stylex.props(s.flexContent)}>
            <Card.Header xstyle={s.gap1}>
              <Card.Title xstyle={s.titleInset}>成为 ACME 创作者！</Card.Title>
              <Card.Description>
                这是一段占位说明文字，用于展示横向卡片布局、配图与右上角关闭按钮的排版效果。
              </Card.Description>
              <CloseButton aria-label="关闭横幅" xstyle={s.close} />
            </Card.Header>
            <Card.Footer xstyle={s.footer}>
              <div {...stylex.props(s.column)}>
                <span {...stylex.props(s.textSm, s.medium, s.foreground)}>仅剩 10 个名额</span>
                <span {...stylex.props(s.textXs, s.muted)}>报名截止：10 月 10 日</span>
              </div>
              <Button xstyle={s.fullAuto}>立即申请</Button>
            </Card.Footer>
          </div>
        </Card>
        <div {...stylex.props(s.gridRow)}>
          <div {...stylex.props(s.gridHalf)}>
            <Card xstyle={s.span12}>
              <div {...stylex.props(s.close, s.z10)}>
                <CloseButton aria-label="关闭通知" />
              </div>
              <Card.Header xstyle={s.gap3}>
                <CircleDollar
                  aria-label="美元图标"
                  {...stylex.props(s.primary, s.icon8, s.shrink0)}
                  role="img"
                />
                <div {...stylex.props(s.column1)}>
                  <span {...stylex.props(s.textXs, s.medium, s.muted, s.uppercase)}>支付</span>
                  <Card.Title xstyle={s.responsiveTitle}>现已支持加密货币提现</Card.Title>
                  <Card.Description xstyle={s.responsiveXs}>
                    在设置中添加钱包即可提现
                  </Card.Description>
                </div>
              </Card.Header>
              <Card.Footer>
                <Link aria-label="前往设置" href="#" rel="noopener noreferrer">
                  前往设置
                  <Link.Icon aria-hidden="true" />
                </Link>
              </Card.Footer>
            </Card>
            <div {...stylex.props(s.gridRow)}>
              <Card xstyle={s.smallCard}>
                <Card.Header>
                  <Avatar xstyle={s.roundedAvatar}>
                    <Avatar.Image alt="演示图片 1" src={`${DOCS}demo1.jpg`} />
                    <Avatar.Fallback>JK</Avatar.Fallback>
                  </Avatar>
                </Card.Header>
                <Card.Content xstyle={s.mt1}>
                  <p {...stylex.props(s.textSm, s.leading4, s.medium)}>Indie Hackers</p>
                  <p {...stylex.props(s.textXs, s.muted)}>148 位成员</p>
                </Card.Content>
                <Card.Footer xstyle={s.row2}>
                  <Avatar xstyle={s.avatarMini}>
                    <Avatar.Image alt="John" src={`${AVATARS}red.jpg`} />
                    <Avatar.Fallback>JK</Avatar.Fallback>
                  </Avatar>
                  <p {...stylex.props(s.textXs, s.muted)}>创建者：约翰</p>
                </Card.Footer>
              </Card>
              <Card xstyle={s.smallCard}>
                <Card.Header>
                  <Avatar xstyle={s.roundedAvatar}>
                    <Avatar.Image alt="演示图片 2" src={`${DOCS}demo2.jpg`} />
                    <Avatar.Fallback>AB</Avatar.Fallback>
                  </Avatar>
                </Card.Header>
                <Card.Content xstyle={s.mt1}>
                  <p {...stylex.props(s.textSm, s.leading4, s.medium)}>AI Builders</p>
                  <p {...stylex.props(s.textXs, s.muted)}>362 位成员</p>
                </Card.Content>
                <Card.Footer xstyle={s.row2}>
                  <Avatar xstyle={s.avatarMini}>
                    <Avatar.Image alt="John" src={`${AVATARS}blue.jpg`} />
                    <Avatar.Fallback>M</Avatar.Fallback>
                  </Avatar>
                  <p {...stylex.props(s.textXs, s.muted)}>创建者：玛莎</p>
                </Card.Footer>
              </Card>
            </div>
          </div>
          <Card xstyle={s.robotCard}>
            <img
              alt="NEO 家用机器人"
              aria-hidden="true"
              {...stylex.props(s.imageCover)}
              src={`${DOCS}neo2.jpeg`}
            />
            <Card.Header xstyle={[s.z10, s.white]}>
              <Card.Title xstyle={[s.textXs, s.semibold, s.tracking, s.black70]}>NEO</Card.Title>
              <Card.Description xstyle={[s.textSm, s.medium, s.black50]}>
                家用机器人
              </Card.Description>
            </Card.Header>
            <Card.Footer xstyle={s.robotFooter}>
              <div>
                <div {...stylex.props(s.textSm, s.medium, s.black)}>即将推出</div>
                <div {...stylex.props(s.textXs, s.black60)}>接收上架通知</div>
              </div>
              <Button xstyle={s.whiteButton} size="sm" variant="tertiary">
                通知我
              </Button>
            </Card.Footer>
          </Card>
        </div>
        <div {...stylex.props(s.gridRow)}>
          <Card xstyle={s.robotLarge}>
            <img
              alt="NEO 家用机器人"
              aria-hidden="true"
              {...stylex.props(s.imageCover)}
              src={`${DOCS}neo1.jpeg`}
            />
            <Card.Footer xstyle={s.robotLargeFooter}>
              <div>
                <div {...stylex.props(s.responsiveBase, s.medium, s.black)}>NEO</div>
                <div {...stylex.props(s.responsiveXs, s.medium, s.black50)}>$499/月</div>
              </div>
              <Button xstyle={s.whiteButton} size="sm" variant="tertiary">
                立即购买
              </Button>
            </Card.Footer>
          </Card>
          <div {...stylex.props(s.robotStack)}>
            <Card xstyle={s.eventCard} variant="transparent">
              <img
                alt="未来感机器人"
                {...stylex.props(s.eventImage)}
                loading="lazy"
                src={`${DOCS}robot1.jpeg`}
              />
              <div {...stylex.props(s.eventContent)}>
                <Card.Title xstyle={s.textSm}>连接未来</Card.Title>
                <Card.Description xstyle={s.textXs}>今天 18:30</Card.Description>
              </div>
            </Card>
            <Card xstyle={s.eventCard} variant="transparent">
              <img
                alt="牛油果"
                {...stylex.props(s.eventImage)}
                loading="lazy"
                src={`${DOCS}avocado.jpeg`}
              />
              <div {...stylex.props(s.eventContent)}>
                <Card.Title xstyle={s.textSm}>牛油果黑客松</Card.Title>
                <Card.Description xstyle={s.textXs}>周三 16:30</Card.Description>
              </div>
            </Card>
            <Card xstyle={s.eventCard} variant="transparent">
              <img
                alt="Sound Electro 活动"
                {...stylex.props(s.eventImage)}
                loading="lazy"
                src={`${DOCS}oranges.jpeg`}
              />
              <div {...stylex.props(s.eventContent)}>
                <Card.Title xstyle={s.textSm}>Sound Electro｜超越艺术</Card.Title>
                <Card.Description xstyle={s.textXs}>周五 20:00</Card.Description>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
