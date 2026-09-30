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
import { Button, ButtonGroup, Chip, Dropdown } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { basicStyles as styles } from "./basic.stylex";
import { styles as sourceStyles } from "./source.stylex";
export function Basic() {
  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.section)}>
        <ButtonGroup>
          <Button>Merge pull request</Button>
          <Dropdown>
            <Dropdown.Trigger
              render={<Button isIconOnly aria-label="More options" xstyle={styles.splitTrigger} />}
            >
              <ButtonGroup.Separator />
              <Button.Icon>
                <ChevronDown />
              </Button.Icon>
            </Dropdown.Trigger>
            <Dropdown.Portal>
              <Dropdown.Positioner side="bottom" align="end">
                <Dropdown.Popup xstyle={styles.popup}>
                  {[
                    {
                      id: "merge",
                      label: "Create a merge commit",
                      description: "All commits from this branch will be added to the base branch",
                    },
                    {
                      id: "squash",
                      label: "Squash and merge",
                      description:
                        "The 14 commits from this branch will be combined into one commit in the base branch",
                    },
                    {
                      id: "rebase",
                      label: "Rebase and merge",
                      description:
                        "The 14 commits from this branch will be rebased and added to the base branch",
                    },
                  ].map((item) => (
                    <Dropdown.Item key={item.id} xstyle={styles.item}>
                      <span {...stylex.props(sourceStyles.menuLabel)}>{item.label}</span>
                      <span {...stylex.props(sourceStyles.menuDescription)}>
                        {item.description}
                      </span>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Popup>
              </Dropdown.Positioner>
            </Dropdown.Portal>
          </Dropdown>
        </ButtonGroup>
      </div>
      <div {...stylex.props(styles.section)}>
        <div {...stylex.props(styles.row)}>
          <ButtonGroup variant="tertiary">
            <Button>
              <CodeFork {...stylex.props(styles.smallIcon)} />
              Fork
              <Chip color="accent" size="sm" variant="soft">
                24
              </Chip>
            </Button>
            <Button isIconOnly aria-label="More fork options">
              <ButtonGroup.Separator />
              <Button.Icon>
                <ChevronDown />
              </Button.Icon>
            </Button>
          </ButtonGroup>
          <ButtonGroup variant="tertiary">
            <Button isIconOnly aria-label="Show QR code">
              <Button.Icon>
                <QrCode />
              </Button.Icon>
            </Button>
            <Button>
              <ButtonGroup.Separator />
              Scan to pay
            </Button>
          </ButtonGroup>
          <ButtonGroup variant="tertiary">
            <Button>
              <Button.Icon>
                <ThumbsUp />
              </Button.Icon>
              <span {...stylex.props(styles.count)}>2.4K</span>
            </Button>
            <Button isIconOnly aria-label="Dislike">
              <ButtonGroup.Separator />
              <Button.Icon>
                <ThumbsDown />
              </Button.Icon>
            </Button>
          </ButtonGroup>
          <ButtonGroup variant="tertiary">
            <Button>
              <Star {...stylex.props(styles.smallIcon)} />
              Star
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
              Pinned
            </Button>
            <Button isIconOnly aria-label="More pin options">
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
            Previous
          </Button>
          <Button>
            <ButtonGroup.Separator />
            Next
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
            Photos
          </Button>
          <Button>
            <ButtonGroup.Separator />
            <Button.Icon>
              <Video />
            </Button.Icon>
            Videos
          </Button>
          <Button isIconOnly aria-label="More options">
            <ButtonGroup.Separator />
            <Button.Icon>
              <Ellipsis />
            </Button.Icon>
          </Button>
        </ButtonGroup>
      </div>
      <div {...stylex.props(styles.section)}>
        <ButtonGroup variant="tertiary">
          <Button>Left</Button>
          <Button>
            <ButtonGroup.Separator />
            Center
          </Button>
          <Button>
            <ButtonGroup.Separator />
            Right
          </Button>
        </ButtonGroup>
      </div>
      <div {...stylex.props(styles.section)}>
        <ButtonGroup variant="tertiary">
          {[
            { label: "Align left", icon: <TextAlignLeft /> },
            { label: "Align center", icon: <TextAlignCenter /> },
            { label: "Align right", icon: <TextAlignRight /> },
            { label: "Justify", icon: <TextAlignJustify /> },
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
