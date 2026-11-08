"use client";

import type { ReactElement } from "react";
import { GlassButton, Menu } from "@lenso/ui";
import {
  BarsDescendingAlignCenter,
  Check,
  ChevronRight,
  Heart,
  LayoutCellsLarge,
  Sliders,
  Clock,
  Camera,
  Moon,
  Sun,
  Persons,
  Person,
  Picture,
  Video,
  Folder,
  CopyPicture,
} from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";

export const photoFilters = {
  all: "All Items",
  favorites: "Favorites",
  edited: "Edited",
  shared: "Shared with You",
  mine: "Taken by Me",
  unfiled: "Not in an Album",
  photos: "Photos",
  videos: "Videos",
  screenshots: "Screenshots",
} as const;
export type PhotoFilter = keyof typeof photoFilters;
const s = stylex.create({
  popup: {
    width: 250,
    maxWidth: "calc(100vw - 24px)",
    "--lg-menu-content-start-scale": ".92",
  },
  sort: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: 0 },
  sortItem: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minHeight: 74,
    justifyContent: "center",
    paddingInlineStart: { default: 4, ":is([role=menuitemradio])": 4 },
    paddingInlineEnd: 4,
    paddingBlock: 8,
    borderRadius: 20,
    fontSize: 13,
    mixBlendMode: "normal",
    color: {
      default: "var(--lenso-label-primary)",
      ":is([data-disabled])": "var(--lenso-label-secondary)",
    },
  },
  sectionLabel: {
    color: "var(--lenso-label-secondary)",
    mixBlendMode: "normal",
    paddingInlineStart: 40,
  },
  active: { backgroundColor: "var(--lenso-fill-tertiary)" },
  unavailable: { fontSize: 10, lineHeight: "12px" },
  triggerContent: { display: "flex", alignItems: "center", justifyContent: "center" },
  round: { width: 44, height: 44, borderRadius: "50%", padding: 0 },
});
export function PhotosLibraryMenu({
  filter,
  onFilter,
  dense,
  onDense,
  cropped,
  onCropped,
  dark,
  onDark,
  library = true,
  grid = true,
  trigger,
}: {
  filter: PhotoFilter;
  onFilter: (value: PhotoFilter) => void;
  dense: boolean;
  onDense: (value: boolean) => void;
  cropped: boolean;
  onCropped: (value: boolean) => void;
  dark: boolean;
  onDark: (value: boolean) => void;
  library?: boolean;
  grid?: boolean;
  trigger?: ReactElement;
}) {
  function item(value: PhotoFilter) {
    const Icon = {
      all: LayoutCellsLarge,
      favorites: Heart,
      edited: Sliders,
      shared: Persons,
      mine: Person,
      unfiled: Folder,
      photos: Picture,
      videos: Video,
      screenshots: CopyPicture,
    }[value];
    return (
      <Menu.RadioItem key={value} value={value} closeOnClick>
        <Menu.RadioItemIndicator>
          <Check />
        </Menu.RadioItemIndicator>
        <Menu.Item.Icon>
          <Icon width={20} height={20} />
        </Menu.Item.Icon>
        <Menu.Item.Label>{photoFilters[value]}</Menu.Item.Label>
      </Menu.RadioItem>
    );
  }
  return (
    <Menu>
      <Menu.Trigger
        render={trigger ?? <GlassButton isIconOnly xstyle={s.round} aria-label="Sort and filter" />}
      >
        <span aria-hidden="true" data-selection-content="" {...stylex.props(s.triggerContent)}>
          <BarsDescendingAlignCenter width={22} height={22} />
        </span>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end">
          <Menu.Popup aria-label="Sort and filter" xstyle={s.popup}>
            {library && (
              <>
                <Menu.RadioGroup value="added" {...stylex.props(s.sort)} aria-label="Sort by">
                  <Menu.RadioItem
                    value="added"
                    aria-label="Date Added"
                    xstyle={[s.sortItem, s.active]}
                  >
                    <Clock width={20} height={20} />
                    Added
                  </Menu.RadioItem>
                  <Menu.RadioItem
                    value="captured"
                    aria-label="Date Captured"
                    disabled
                    title="Capture dates are unavailable for these samples"
                    xstyle={s.sortItem}
                  >
                    <Camera width={20} height={20} />
                    Captured
                    <span {...stylex.props(s.unavailable)}>Unavailable</span>
                  </Menu.RadioItem>
                </Menu.RadioGroup>
                <Menu.Separator />
                <Menu.Group>
                  <Menu.Group.Label xstyle={s.sectionLabel}>Filter</Menu.Group.Label>
                  <Menu.RadioGroup
                    value={filter}
                    onValueChange={(value) => onFilter(value as PhotoFilter)}
                  >
                    {(["all", "favorites", "edited", "shared", "mine", "unfiled"] as const).map(
                      item,
                    )}
                  </Menu.RadioGroup>
                  <Menu.SubmenuRoot>
                    <Menu.SubmenuTrigger>
                      <Menu.Item.Icon>
                        <CopyPicture width={20} height={20} />
                      </Menu.Item.Icon>
                      <Menu.Item.Label>Media Types</Menu.Item.Label>
                      <Menu.Item.SubmenuIndicator>
                        <ChevronRight />
                      </Menu.Item.SubmenuIndicator>
                    </Menu.SubmenuTrigger>
                    <Menu.Portal>
                      <Menu.Positioner>
                        <Menu.Popup aria-label="Media types">
                          <Menu.RadioGroup
                            value={filter}
                            onValueChange={(value) => onFilter(value as PhotoFilter)}
                          >
                            {(["photos", "videos", "screenshots"] as const).map(item)}
                          </Menu.RadioGroup>
                        </Menu.Popup>
                      </Menu.Positioner>
                    </Menu.Portal>
                  </Menu.SubmenuRoot>
                </Menu.Group>
                <Menu.Separator />
              </>
            )}
            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger>
                View Options
                <Menu.Item.SubmenuIndicator>
                  <ChevronRight />
                </Menu.Item.SubmenuIndicator>
              </Menu.SubmenuTrigger>
              <Menu.Portal>
                <Menu.Positioner>
                  <Menu.Popup aria-label="View options">
                    {grid && (
                      <>
                        <Menu.Item disabled={!dense} onClick={() => onDense(false)}>
                          Zoom In
                        </Menu.Item>
                        <Menu.Item disabled={dense} onClick={() => onDense(true)}>
                          Zoom Out
                        </Menu.Item>
                        <Menu.CheckboxItem
                          checked={!cropped}
                          onCheckedChange={(value) => onCropped(!value)}
                          closeOnClick={false}
                        >
                          <Menu.CheckboxItemIndicator>
                            <Check />
                          </Menu.CheckboxItemIndicator>
                          Aspect Ratio Grid
                        </Menu.CheckboxItem>
                        <Menu.Separator />
                      </>
                    )}
                    <Menu.Item onClick={() => onDark(!dark)}>
                      <Menu.Item.Icon>{dark ? <Sun /> : <Moon />}</Menu.Item.Icon>
                      {dark ? "Light appearance" : "Dark appearance"}
                    </Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.SubmenuRoot>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu>
  );
}
