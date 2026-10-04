// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CodeFork,
  Ellipsis,
  Picture,
  Pin,
  QrCode,
  Star,
  TextAlignCenter,
  TextAlignJustify,
  TextAlignLeft,
  TextAlignRight,
  ThumbsDown,
  ThumbsUp,
  Video,
} from "@gravity-ui/icons";
import { Button, ButtonGroup, Chip, Menu } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { basicStyles as styles } from "../../en/button-group/basic.stylex";
import { styles as sourceStyles } from "../../en/button-group/source.stylex";
export function Basic() {
  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.section)}>
        <ButtonGroup>
          <Button>合并拉取请求</Button>
          <Menu>
            <Menu.Trigger
              render={<Button isIconOnly aria-label="更多选项" xstyle={styles.splitTrigger} />}
            >
              <ButtonGroup.Separator />
              <Button.Icon>
                <ChevronDown />
              </Button.Icon>
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner side="bottom" align="end">
                <Menu.Popup xstyle={styles.popup}>
                  {[
                    {
                      id: "merge",
                      label: "创建合并提交",
                      description: "此分支上的所有提交都将加入基础分支",
                    },
                    {
                      id: "squash",
                      label: "压缩并合并",
                      description: "此分支上的 14 个提交将合并为一次提交并加入基础分支",
                    },
                    {
                      id: "rebase",
                      label: "变基并合并",
                      description: "此分支上的 14 个提交将变基后加入基础分支",
                    },
                  ].map((item) => (
                    <Menu.Item key={item.id} xstyle={styles.item}>
                      <span {...stylex.props(sourceStyles.menuLabel)}>{item.label}</span>
                      <span {...stylex.props(sourceStyles.menuDescription)}>
                        {item.description}
                      </span>
                    </Menu.Item>
                  ))}
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu>
        </ButtonGroup>
      </div>
      <div {...stylex.props(styles.section)}>
        <div {...stylex.props(styles.row)}>
          <ButtonGroup variant="tertiary">
            <Button>
              <CodeFork {...stylex.props(styles.smallIcon)} />
              复刻
              <Chip color="accent" size="sm" variant="soft">
                24
              </Chip>
            </Button>
            <Button isIconOnly aria-label="更多复刻选项">
              <ButtonGroup.Separator />
              <Button.Icon>
                <ChevronDown />
              </Button.Icon>
            </Button>
          </ButtonGroup>
          <ButtonGroup variant="tertiary">
            <Button isIconOnly aria-label="显示二维码">
              <Button.Icon>
                <QrCode />
              </Button.Icon>
            </Button>
            <Button>
              <ButtonGroup.Separator />
              扫码支付
            </Button>
          </ButtonGroup>
          <ButtonGroup variant="tertiary">
            <Button>
              <Button.Icon>
                <ThumbsUp />
              </Button.Icon>
              <span {...stylex.props(styles.count)}>2.4K</span>
            </Button>
            <Button isIconOnly aria-label="点踩">
              <ButtonGroup.Separator />
              <Button.Icon>
                <ThumbsDown />
              </Button.Icon>
            </Button>
          </ButtonGroup>
          <ButtonGroup variant="tertiary">
            <Button>
              <Star {...stylex.props(styles.smallIcon)} />
              星标
            </Button>
            <Button xstyle={styles.countButton}>
              <ButtonGroup.Separator />
              <Chip color="accent" size="sm" variant="soft">
                104
              </Chip>
            </Button>
          </ButtonGroup>
          <ButtonGroup variant="tertiary">
            <Button>
              <Button.Icon>
                <Pin />
              </Button.Icon>
              已置顶
            </Button>
            <Button isIconOnly aria-label="更多置顶选项">
              <ButtonGroup.Separator />
              <Button.Icon>
                <ChevronDown />
              </Button.Icon>
            </Button>
          </ButtonGroup>
        </div>
      </div>
      <div {...stylex.props(styles.section)}>
        <ButtonGroup variant="tertiary">
          <Button>
            <Button.Icon>
              <ChevronLeft />
            </Button.Icon>
            上一页
          </Button>
          <Button>
            <ButtonGroup.Separator />
            下一页
            <Button.Icon>
              <ChevronRight />
            </Button.Icon>
          </Button>
        </ButtonGroup>
      </div>
      <div {...stylex.props(styles.section)}>
        <ButtonGroup variant="tertiary">
          <Button>
            <Button.Icon>
              <Picture />
            </Button.Icon>
            照片
          </Button>
          <Button>
            <ButtonGroup.Separator />
            <Button.Icon>
              <Video />
            </Button.Icon>
            视频
          </Button>
          <Button isIconOnly aria-label="更多选项">
            <ButtonGroup.Separator />
            <Button.Icon>
              <Ellipsis />
            </Button.Icon>
          </Button>
        </ButtonGroup>
      </div>
      <div {...stylex.props(styles.section)}>
        <ButtonGroup variant="tertiary">
          <Button>左对齐</Button>
          <Button>
            <ButtonGroup.Separator />
            居中
          </Button>
          <Button>
            <ButtonGroup.Separator />
            右对齐
          </Button>
        </ButtonGroup>
      </div>
      <div {...stylex.props(styles.section)}>
        <ButtonGroup variant="tertiary">
          {[
            {
              label: "左对齐",
              icon: <TextAlignLeft />,
            },
            {
              label: "居中对齐",
              icon: <TextAlignCenter />,
            },
            {
              label: "右对齐",
              icon: <TextAlignRight />,
            },
            {
              label: "两端对齐",
              icon: <TextAlignJustify />,
            },
          ].map((item, index) => (
            <Button key={item.label} isIconOnly aria-label={item.label}>
              {index > 0 && <ButtonGroup.Separator />}
              <Button.Icon>{item.icon}</Button.Icon>
            </Button>
          ))}
        </ButtonGroup>
      </div>
    </div>
  );
}
