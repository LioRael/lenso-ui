"use client";

import { useState } from "react";
import { AlertDialog, Button, Link, Popover, Sheet, Toolbar, Menu } from "@lenso/ui";
import { ArrowUpFromSquare, TrashBin, Ellipsis, Heart, ChevronRight } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { albumNames, library, type DemoPhoto } from "../lib/photos-library";
import { PhotoImage } from "./photos-image";

const s = stylex.create({
  toolbar: { width: "100%", display: "flex", justifyContent: "space-between", gap: 12 },
  icon: { width: 44, height: 44, minWidth: 44, paddingInline: 0, paddingBlock: 0 },
  counter: { minHeight: 44, paddingInline: 20 },
  share: { width: 280, maxHeight: "60dvh", overflowY: "auto" },
  downloads: { display: "flex", flexDirection: "column", gap: 12, marginBlock: 16 },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 4 },
  tile: {
    paddingBlock: 0,
    paddingInline: 0,
    aspectRatio: "1",
    borderRadius: 8,
    overflow: "hidden",
  },
  popup: { width: "min(600px, 100%)" },
});
export function PhotosSelectionActions({
  photos,
  onDeselect,
  onDelete,
}: {
  photos: DemoPhoto[];
  onDeselect: (id: number) => void;
  onDelete: () => void;
}) {
  const [preview, setPreview] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [status, setStatus] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        photos
          .map(
            (p) =>
              new URL(p.src.startsWith("blob:") ? library[p.id]!.src : p.src, location.href).href,
          )
          .join("\n"),
      );
      setStatus("Image links copied");
    } catch {
      setStatus("Couldn't copy. Use a Save link instead.");
    }
  }
  return (
    <>
      <Toolbar data-photo-selection-footer="" aria-label="Selection actions" xstyle={s.toolbar}>
        <Toolbar.Group>
          <Popover onOpenChange={() => setStatus("")}>
            <Popover.Trigger
              disabled={!photos.length}
              render={
                <Toolbar.Button
                  aria-label="Share selected photos"
                  disabled={!photos.length}
                  xstyle={s.icon}
                />
              }
            >
              <ArrowUpFromSquare width={22} height={22} />
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner side="top" align="start" sideOffset={12}>
                <Popover.Popup xstyle={s.share}>
                  <Popover.Title>
                    Share {photos.length} {photos.length === 1 ? "Photo" : "Photos"}
                  </Popover.Title>
                  <div {...stylex.props(s.downloads)}>
                    {photos.map((p) => (
                      <Link key={p.id} href={p.src} download={`${p.title}.jpg`}>
                        Save {p.title}
                      </Link>
                    ))}
                  </div>
                  <Button onClick={copy}>
                    {photos.some((p) => p.src.startsWith("blob:"))
                      ? "Copy Original Image Links"
                      : "Copy Image Links"}
                  </Button>
                  <output>{status}</output>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover>
        </Toolbar.Group>
        <Toolbar.Group>
          <Toolbar.Button
            disabled={!photos.length}
            xstyle={s.counter}
            aria-label={`Show selected photos (${photos.length})`}
            onClick={() => setPreview(true)}
          >
            {photos.length
              ? `${photos.length} ${photos.length === 1 ? "Photo" : "Photos"}`
              : "Select Items"}
          </Toolbar.Button>
        </Toolbar.Group>
        <Toolbar.Group>
          <Toolbar.Button
            aria-label="Delete selected photos"
            disabled={!photos.length}
            xstyle={s.icon}
            onClick={() => setConfirm(true)}
          >
            <TrashBin width={22} height={22} />
          </Toolbar.Button>
        </Toolbar.Group>
      </Toolbar>
      <Sheet open={preview} onOpenChange={setPreview}>
        <Sheet.Portal>
          <Sheet.Backdrop />
          <Sheet.Viewport>
            <Sheet.Popup xstyle={s.popup}>
              <Sheet.Handle />
              <Sheet.Header>
                <Sheet.Close aria-label="Close selected photos" />
                <Sheet.Title>Selected Photos ({photos.length})</Sheet.Title>
              </Sheet.Header>
              <Sheet.Body>
                {photos.length ? (
                  <div {...stylex.props(s.grid)}>
                    {photos.map((p) => (
                      <Button
                        key={p.id}
                        variant="borderless"
                        xstyle={s.tile}
                        aria-label={`Deselect ${p.title}`}
                        aria-pressed
                        onClick={() => onDeselect(p.id)}
                      >
                        <PhotoImage photo={p} />
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p>No photos selected.</p>
                )}
              </Sheet.Body>
            </Sheet.Popup>
          </Sheet.Viewport>
        </Sheet.Portal>
      </Sheet>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop />
          <AlertDialog.Viewport>
            <AlertDialog.Popup>
              <AlertDialog.Header>
                <AlertDialog.Title>
                  Delete {photos.length} {photos.length === 1 ? "photo" : "photos"}?
                </AlertDialog.Title>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <AlertDialog.Description>
                  Remove these photos from this sample library? You can undo this in the library.
                </AlertDialog.Description>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <AlertDialog.Action variant="cancel">Cancel</AlertDialog.Action>
                <AlertDialog.Action
                  variant="destructive"
                  onClick={() => {
                    onDelete();
                    setConfirm(false);
                  }}
                >
                  Delete {photos.length === 1 ? "Photo" : "Photos"}
                </AlertDialog.Action>
              </AlertDialog.Footer>
            </AlertDialog.Popup>
          </AlertDialog.Viewport>
        </AlertDialog.Portal>
      </AlertDialog>
    </>
  );
}

export function PhotosSelectionMenu({
  count,
  active = true,
  allFavorites,
  onFavorite,
  onAddTo,
  onClear,
}: {
  count: number;
  active?: boolean;
  allFavorites: boolean;
  onFavorite: () => void;
  onAddTo: (album: DemoPhoto["collection"]) => void;
  onClear: () => void;
}) {
  return (
    <Menu>
      <Menu.Trigger
        disabled={!count || !active}
        render={
          <Toolbar.Button
            aria-label="More selection actions"
            disabled={!count || !active}
            xstyle={s.icon}
          />
        }
      >
        <span aria-hidden="true" data-selection-content="">
          <Ellipsis width={22} height={22} />
        </span>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end">
          <Menu.Popup aria-label="Selection options">
            <Menu.Item onClick={onFavorite}>
              <Menu.Item.Icon>
                <Heart />
              </Menu.Item.Icon>
              {allFavorites ? "Remove from Favorites" : "Favorite"}
            </Menu.Item>
            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger>
                Add to Album
                <Menu.Item.SubmenuIndicator>
                  <ChevronRight />
                </Menu.Item.SubmenuIndicator>
              </Menu.SubmenuTrigger>
              <Menu.Portal>
                <Menu.Positioner>
                  <Menu.Popup aria-label="Add to album">
                    {albumNames.map((name) => (
                      <Menu.Item key={name} onClick={() => onAddTo(name)}>
                        {name}
                      </Menu.Item>
                    ))}
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.SubmenuRoot>
            <Menu.Separator />
            <Menu.Item onClick={onClear}>Deselect All</Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu>
  );
}
