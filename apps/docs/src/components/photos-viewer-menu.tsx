import { GlassButton, Menu } from "@lenso/ui";
import {
  Copy,
  CopyPlus,
  EyeSlash,
  Play,
  CopyPicture,
  CircleInfo,
  ChevronRight,
  Ellipsis,
} from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { albumNames, type DemoPhoto } from "../lib/photos-library";
import { photos as s } from "../styles/photos-demo.stylex";

const menu = stylex.create({
  popup: { width: 250, maxWidth: "calc(100vw - 24px)", "--lg-menu-content-start-scale": ".92" },
});

export function PhotosViewerMenu({
  open,
  onOpenChange,
  onCopy,
  onDuplicate,
  onHide,
  onSlideshow,
  onAlbum,
  onInformation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCopy: () => void;
  onDuplicate: () => void;
  onHide: () => void;
  onSlideshow: () => void;
  onAlbum: (album: DemoPhoto["collection"]) => void;
  onInformation: () => void;
}) {
  return (
    <Menu open={open} onOpenChange={onOpenChange} morphTrigger>
      <Menu.Trigger
        render={
          <GlassButton
            data-photo-control=""
            size="md"
            xstyle={s.roundControl}
            isIconOnly
            aria-label="Photo options"
          />
        }
      >
        <Ellipsis width={24} height={24} />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end">
          <Menu.Popup aria-label="Photo options" xstyle={menu.popup}>
            <Menu.ActionGroup aria-label="Photo actions">
              <Menu.Action onClick={onCopy}>
                <Copy width={22} height={22} />
                Copy
              </Menu.Action>
              <Menu.Action onClick={onDuplicate}>
                <CopyPlus width={22} height={22} />
                Duplicate
              </Menu.Action>
              <Menu.Action onClick={onHide}>
                <EyeSlash width={22} height={22} />
                Hide
              </Menu.Action>
            </Menu.ActionGroup>
            <Menu.Separator />
            <Menu.Item onClick={onSlideshow}>
              <Menu.Item.Icon>
                <Play width={22} height={22} />
              </Menu.Item.Icon>
              <Menu.Item.Label>Play Slideshow</Menu.Item.Label>
            </Menu.Item>
            <Menu.Separator />
            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger>
                <Menu.Item.Icon>
                  <CopyPicture width={22} height={22} />
                </Menu.Item.Icon>
                <Menu.Item.Label>Add to</Menu.Item.Label>
                <Menu.Item.SubmenuIndicator>
                  <ChevronRight />
                </Menu.Item.SubmenuIndicator>
              </Menu.SubmenuTrigger>
              <Menu.Portal>
                <Menu.Positioner>
                  <Menu.Popup aria-label="Add to album">
                    {albumNames.map((name) => (
                      <Menu.Item key={name} onClick={() => onAlbum(name)}>
                        {name}
                      </Menu.Item>
                    ))}
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.SubmenuRoot>
            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger>
                <Menu.Item.Icon>
                  <CircleInfo width={22} height={22} />
                </Menu.Item.Icon>
                <Menu.Item.Label>Adjust Information</Menu.Item.Label>
                <Menu.Item.SubmenuIndicator>
                  <ChevronRight />
                </Menu.Item.SubmenuIndicator>
              </Menu.SubmenuTrigger>
              <Menu.Portal>
                <Menu.Positioner>
                  <Menu.Popup aria-label="Adjust information">
                    <Menu.Item onClick={onInformation}>Edit Caption</Menu.Item>
                    <Menu.Item
                      disabled
                      title="Capture dates were not supplied with these sample photos"
                    >
                      Adjust Date and Time
                    </Menu.Item>
                    <Menu.Item
                      disabled
                      title="Locations were not supplied with these sample photos"
                    >
                      Adjust Location
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
