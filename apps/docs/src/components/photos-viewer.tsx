import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { AlertDialog, Button, GlassButton, Link, Modal, Popover, Toolbar } from "@lenso/ui";
import {
  ArrowUpFromSquare,
  ChevronLeft,
  CircleInfo,
  Heart,
  HeartFill,
  TrashBin,
  Sliders,
} from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import type { DemoPhoto } from "../lib/photos-library";
import { photos as s } from "../styles/photos-demo.stylex";
import { PhotoImage } from "./photos-image";
import { usePhotoZoom } from "./photos-zoom";
import { usePhotoSurface } from "./photos-surface";
import { PhotosEditor } from "./photos-editor";
import { PhotosViewerMenu } from "./photos-viewer-menu";
import { PhotoInformation } from "./photos-information";
import { originalAdjustments, type PhotoEdit } from "../lib/photos-adjustments";

type ViewerProps = {
  selected: number | null;
  photos: DemoPhoto[];
  originals: DemoPhoto[];
  tiles: RefObject<Map<number, HTMLElement>>;
  pointerOpened: RefObject<boolean>;
  favorites: Set<number>;
  onClose: () => void;
  onChange: (id: number) => void;
  onFavorite: (id: number) => void;
  onDelete: (id: number) => void;
  onHide: (id: number) => void;
  onDuplicate: (id: number) => void;
  onAlbum: (id: number, album: DemoPhoto["collection"]) => void;
  edits: Map<number, PhotoEdit>;
  onEdit: (id: number, edit: PhotoEdit | undefined) => void;
  captions: Map<number, string>;
  onCaption: (id: number, value: string) => void;
};

export function PhotosViewer({
  selected,
  photos,
  originals,
  tiles,
  pointerOpened,
  favorites,
  onClose,
  onChange,
  onFavorite,
  onDelete,
  onHide,
  onDuplicate,
  onAlbum,
  edits,
  onEdit,
  captions,
  onCaption,
}: ViewerProps) {
  const [immersive, setImmersive] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const infoButton = useRef<HTMLButtonElement>(null);
  const [slideshow, setSlideshow] = useState(false);
  const popup = useRef<HTMLDivElement>(null);
  const finishClose = useCallback(() => {
    setImmersive(false);
    setSlideshow(false);
    setInfoOpen(false);
    onClose();
  }, [onClose]);
  const presentation = usePhotoZoom(selected, tiles, finishClose, pointerOpened);
  const [confirmation, setConfirmation] = useState<{
    kind: "delete" | "revert" | "hide";
    id: number;
  } | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  function confirm(kind: "delete" | "revert" | "hide", id: number) {
    setConfirmation({ kind, id });
    setConfirmationOpen(true);
  }
  const [shareStatus, setShareStatus] = useState("");
  const [statusPhoto, setStatusPhoto] = useState<number | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const photo = photos.find((item) => item.id === selected);
  const index = photos.findIndex((item) => item.id === selected);
  const previous = photos[index - 1];
  const next = photos[index + 1];
  useEffect(() => {
    if (!slideshow || selected === null || editing || infoOpen || moreOpen) return;
    const timer = setTimeout(() => onChange(photos[(index + 1) % photos.length]!.id), 3000);
    return () => clearTimeout(timer);
  }, [slideshow, selected, index, photos, onChange, editing, infoOpen, moreOpen]);
  function toggleControls() {
    popup.current?.focus({ preventScroll: true });
    setImmersive((previous) => !previous);
  }
  const surface = usePhotoSurface(
    presentation,
    selected,
    previous?.id,
    next?.id,
    onChange,
    toggleControls,
  );
  const { ghostRef, backdropRef, chromeRef } = presentation;
  const { close, gestureHandlers, surfaceRef, trackRef, imageRef, keyDown, cancelTap } = surface;
  async function copyLink() {
    if (!photo) return;
    setStatusPhoto(photo.id);
    try {
      await navigator.clipboard.writeText(
        new URL(originals.find((p) => p.id === photo.id)!.src, location.origin).href,
      );
      setShareStatus("Image link copied");
    } catch {
      setShareStatus("Couldn't copy the link. You can save the image instead.");
    }
  }
  async function copyPhoto() {
    if (!photo) return;
    setStatusPhoto(photo.id);
    try {
      const png = fetch(photo.src)
        .then((response) => {
          if (!response.ok) throw new Error("Image unavailable");
          return response.blob();
        })
        .then(async (blob) => {
          const bitmap = await createImageBitmap(blob);
          try {
            const canvas = document.createElement("canvas");
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const context = canvas.getContext("2d");
            if (!context) throw new Error("Canvas unavailable");
            context.drawImage(bitmap, 0, 0);
            return await new Promise<Blob>((resolve, reject) =>
              canvas.toBlob(
                (value) => (value ? resolve(value) : reject(new Error("Copy unavailable"))),
                "image/png",
              ),
            );
          } finally {
            bitmap.close();
          }
        });
      await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
      setShareStatus("Photo copied");
    } catch {
      setShareStatus("Couldn't copy the photo. Use Share to save it instead.");
    }
  }
  return (
    <>
      <Modal
        open={photo !== undefined}
        onOpenChange={(open, details) => {
          if (!open && infoOpen && details.reason === "escape-key") {
            details.cancel();
            setInfoOpen(false);
            infoButton.current?.focus({ preventScroll: true });
            return;
          }
          if (!open) close(details.reason !== "escape-key");
        }}
      >
        <Modal.Portal>
          <Modal.Backdrop variant="transparent" xstyle={s.instantBackdrop} />
          <Modal.Viewport>
            <Modal.Popup
              ref={popup}
              size="full"
              xstyle={s.viewer}
              onKeyDown={(event) => {
                if (
                  event.defaultPrevented ||
                  event.ctrlKey ||
                  event.metaKey ||
                  event.altKey ||
                  event.target instanceof HTMLInputElement ||
                  event.target instanceof HTMLTextAreaElement ||
                  (event.target instanceof Element &&
                    (event.target.closest(
                      '[data-photo-information], [data-slot="popover-popup"], [data-slot="sheet-popup"], [data-slot="menu-popup"], [data-slot="action-sheet-popup"]',
                    ) ||
                      event.target.closest('[data-slot="modal-popup"]') !== event.currentTarget))
                )
                  return;
                keyDown(event);
                if (event.defaultPrevented) return;
                if (event.key === "ArrowRight" && index < photos.length - 1) {
                  event.preventDefault();
                  onChange(photos[index + 1]!.id);
                }
                if (event.key === "ArrowLeft" && index > 0) {
                  event.preventDefault();
                  onChange(photos[index - 1]!.id);
                }
              }}
            >
              {photo && (
                <>
                  <div
                    ref={backdropRef}
                    aria-hidden="true"
                    {...stylex.props(s.viewerBackdrop, immersive && s.immersiveBackdrop)}
                  />
                  {immersive && (
                    <Button variant="borderless" xstyle={s.showControls} onClick={toggleControls}>
                      Show photo controls
                    </Button>
                  )}
                  <div ref={chromeRef} {...stylex.props(s.viewerContent)}>
                    <header
                      inert={immersive || infoOpen}
                      aria-hidden={immersive || infoOpen || undefined}
                      onPointerDownCapture={cancelTap}
                      {...stylex.props(s.viewerHeader, (immersive || infoOpen) && s.chromeHidden)}
                    >
                      <Modal.Close
                        render={
                          <GlassButton
                            data-photo-control=""
                            size="md"
                            xstyle={s.roundControl}
                            isIconOnly
                            aria-label="Close photo"
                            icon={<ChevronLeft width={24} height={24} />}
                          />
                        }
                      />
                      <Toolbar aria-label="Photo title" xstyle={s.titleToolbar}>
                        <Toolbar.Group data-photo-control="" xstyle={s.metadataGroup}>
                          <div {...stylex.props(s.viewerMetadata)}>
                            <Modal.Title xstyle={s.viewerTitle}>{photo.title}</Modal.Title>
                            <Modal.Description xstyle={s.viewerDescription}>
                              {photo.collection} · {photo.width} × {photo.height}
                            </Modal.Description>
                          </div>
                        </Toolbar.Group>
                      </Toolbar>
                      <PhotosViewerMenu
                        open={moreOpen}
                        onOpenChange={(open) => {
                          setMoreOpen(open);
                          if (open) setShareStatus("");
                        }}
                        onCopy={copyPhoto}
                        onDuplicate={() => onDuplicate(photo.id)}
                        onHide={() => confirm("hide", photo.id)}
                        onSlideshow={() => {
                          setSlideshow(true);
                          setImmersive(true);
                        }}
                        onAlbum={(name) => {
                          onAlbum(photo.id, name);
                          setStatusPhoto(photo.id);
                          setShareStatus(`Added photo to ${name}`);
                        }}
                        onInformation={() => setInfoOpen(true)}
                      />
                    </header>
                    <div
                      ref={surfaceRef}
                      data-photo-surface=""
                      {...gestureHandlers}
                      {...stylex.props(
                        s.viewerImage,
                        immersive && s.immersiveImage,
                        infoOpen && s.infoPreviewImage,
                      )}
                    >
                      <div ref={trackRef} {...stylex.props(s.photoTrack)}>
                        <div ref={imageRef} data-photo-current="" {...stylex.props(s.photoSlide)}>
                          <PhotoImage key={photo.id} photo={photo} full />
                        </div>
                        {[-2, -1, 1, 2].map((offset) => {
                          const adjacent = photos[index + offset];
                          return (
                            adjacent && (
                              <div
                                key={adjacent.id}
                                aria-hidden="true"
                                inert
                                {...stylex.props(s.photoSlide, s.photoOffset(offset))}
                              >
                                <img
                                  src={adjacent.src}
                                  alt=""
                                  draggable={false}
                                  {...stylex.props(s.image, s.fullImage)}
                                />
                              </div>
                            )
                          );
                        })}
                      </div>
                    </div>
                    <PhotoInformation
                      photo={photo}
                      open={infoOpen}
                      caption={captions.get(photo.id) ?? ""}
                      onCaptionChange={(value) => onCaption(photo.id, value)}
                      edited={edits.has(photo.id)}
                    />
                    <div
                      data-photo-control=""
                      inert={immersive || infoOpen}
                      aria-hidden={immersive || infoOpen || undefined}
                      onPointerDownCapture={cancelTap}
                      aria-label="Photo filmstrip"
                      {...stylex.props(
                        s.filmstrip,
                        immersive && s.chromeHidden,
                        infoOpen && s.infoChromeHidden,
                      )}
                    >
                      {photos.map((item) => (
                        <Button
                          key={item.id}
                          variant="borderless"
                          aria-label={`View ${item.title}`}
                          aria-pressed={item.id === selected}
                          ref={(node) => {
                            if (node && item.id === selected)
                              node.scrollIntoView({ block: "nearest", inline: "center" });
                          }}
                          xstyle={[s.filmstripItem, item.id === selected && s.filmstripCurrent]}
                          onClick={() => onChange(item.id)}
                        >
                          <img
                            src={item.thumb}
                            alt=""
                            draggable={false}
                            {...stylex.props(s.image)}
                          />
                        </Button>
                      ))}
                    </div>
                    <Toolbar
                      aria-label="Photo actions"
                      inert={immersive}
                      aria-hidden={immersive || undefined}
                      onPointerDownCapture={cancelTap}
                      xstyle={[s.viewerControls, immersive && s.chromeHidden]}
                    >
                      <Popover
                        open={shareOpen}
                        onOpenChange={(open) => {
                          setShareOpen(open);
                          setShareStatus("");
                        }}
                      >
                        <Popover.Trigger
                          render={
                            <GlassButton
                              data-photo-control=""
                              size="md"
                              xstyle={s.roundControl}
                              isIconOnly
                              aria-label="Share photo"
                              icon={<ArrowUpFromSquare width={22} height={22} />}
                            />
                          }
                        />
                        <Popover.Portal>
                          <Popover.Positioner side="top" align="start" sideOffset={16}>
                            <Popover.Popup xstyle={s.options}>
                              <Popover.Title>Share photo</Popover.Title>
                              <Link href={photo.src} download={`${photo.title}.jpg`}>
                                Save Image
                              </Link>
                              <Button variant="borderless" onClick={copyLink}>
                                {edits.has(photo.id)
                                  ? "Copy Original Image Link"
                                  : "Copy Image Link"}
                              </Button>
                              {shareStatus && (
                                <output {...stylex.props(s.secondary)}>{shareStatus}</output>
                              )}
                            </Popover.Popup>
                          </Popover.Positioner>
                        </Popover.Portal>
                      </Popover>
                      <Toolbar.Group data-photo-control="" xstyle={s.viewerActionGroup}>
                        <Toolbar.Button
                          xstyle={s.toolButton}
                          aria-label={
                            favorites.has(photo.id) ? "Remove from favorites" : "Add to favorites"
                          }
                          aria-pressed={favorites.has(photo.id)}
                          onClick={() => onFavorite(photo.id)}
                        >
                          {favorites.has(photo.id) ? (
                            <HeartFill width={23} height={23} />
                          ) : (
                            <Heart width={23} height={23} />
                          )}
                        </Toolbar.Button>
                        <Toolbar.Button
                          xstyle={s.toolButton}
                          ref={infoButton}
                          aria-label="Photo information"
                          aria-expanded={infoOpen}
                          onClick={() => setInfoOpen((open) => !open)}
                        >
                          <CircleInfo width={23} height={23} />
                        </Toolbar.Button>
                        <Toolbar.Button
                          xstyle={s.toolButton}
                          aria-label="Edit photo"
                          onClick={() => setEditing(true)}
                        >
                          <Sliders width={23} height={23} />
                        </Toolbar.Button>
                      </Toolbar.Group>
                      <GlassButton
                        data-photo-control=""
                        size="md"
                        xstyle={s.roundControl}
                        isIconOnly
                        aria-label="Delete photo"
                        icon={<TrashBin width={22} height={22} />}
                        onClick={() => confirm("delete", photo.id)}
                      />
                    </Toolbar>
                    <span aria-live="polite" {...stylex.props(s.visuallyHidden)}>
                      Photo {index + 1} of {photos.length}
                    </span>
                  </div>
                  <div ref={ghostRef} aria-hidden="true" inert {...stylex.props(s.zoomLayer)}>
                    <img src={photo.src} alt="" {...stylex.props(s.zoomImage)} />
                  </div>
                  {editing && (
                    <PhotosEditor
                      key={photo.id}
                      photo={originals.find((item) => item.id === photo.id)!}
                      initial={edits.get(photo.id)?.adjustments ?? originalAdjustments}
                      onClose={() => setEditing(false)}
                      onSave={(edit) => {
                        onEdit(photo.id, edit);
                        setEditing(false);
                      }}
                    />
                  )}
                  {slideshow && (
                    <Button
                      xstyle={s.slideshowStop}
                      onClick={() => {
                        setSlideshow(false);
                        setImmersive(false);
                      }}
                    >
                      Stop Slideshow
                    </Button>
                  )}
                  {!shareOpen && statusPhoto === photo.id && shareStatus && (
                    <output {...stylex.props(s.viewerStatus)}>{shareStatus}</output>
                  )}
                </>
              )}
            </Modal.Popup>
          </Modal.Viewport>
        </Modal.Portal>
      </Modal>
      <AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop />
          <AlertDialog.Viewport>
            <AlertDialog.Popup>
              <AlertDialog.Header>
                <AlertDialog.Title>
                  {confirmation?.kind === "revert"
                    ? "Revert to original?"
                    : confirmation?.kind === "hide"
                      ? "Hide this photo?"
                      : "Delete this photo?"}
                </AlertDialog.Title>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <AlertDialog.Description>
                  {confirmation?.kind === "revert"
                    ? "All adjustments to this photo will be removed. The original photo will be restored."
                    : confirmation?.kind === "hide"
                      ? "This hides the photo from this sample library. You can undo it in the library."
                      : "This removes the photo from this sample library. You can undo it in the library."}
                </AlertDialog.Description>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <AlertDialog.Action variant="cancel">Cancel</AlertDialog.Action>
                <AlertDialog.Action
                  variant="destructive"
                  onClick={() => {
                    if (confirmation?.kind === "revert") onEdit(confirmation.id, undefined);
                    else if (confirmation?.kind === "delete") onDelete(confirmation.id);
                    else if (confirmation?.kind === "hide") onHide(confirmation.id);
                    setConfirmationOpen(false);
                  }}
                >
                  {confirmation?.kind === "revert"
                    ? "Revert to Original"
                    : confirmation?.kind === "hide"
                      ? "Hide Photo"
                      : "Delete Photo"}
                </AlertDialog.Action>
              </AlertDialog.Footer>
            </AlertDialog.Popup>
          </AlertDialog.Viewport>
        </AlertDialog.Portal>
      </AlertDialog>
    </>
  );
}
