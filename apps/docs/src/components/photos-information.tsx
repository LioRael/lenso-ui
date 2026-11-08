/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The metadata region needs focus for native keyboard scrolling. */
import { useEffect, useId, useState } from "react";
import { TextArea } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import type { DemoPhoto } from "../lib/photos-library";
import { photos as s } from "../styles/photos-demo.stylex";

export function PhotoInformation({
  photo,
  open,
  caption,
  onCaptionChange,
  edited,
}: {
  photo: DemoPhoto;
  open: boolean;
  caption: string;
  onCaptionChange: (value: string) => void;
  edited: boolean;
}) {
  const captionId = useId();
  const [metadata, setMetadata] = useState<{ src: string; size: number; type: string } | null>(
    null,
  );
  const [failedSource, setFailedSource] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    fetch(photo.src, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Image unavailable");
        return response.blob();
      })
      .then((blob) => {
        if (!controller.signal.aborted)
          setMetadata({ src: photo.src, size: blob.size, type: blob.type });
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailedSource(photo.src);
      });
    return () => controller.abort();
  }, [open, photo.src]);
  const file = metadata?.src === photo.src ? metadata : null;
  const megapixels = ((photo.width * photo.height) / 1_000_000).toFixed(1);
  const size = file
    ? file.size >= 1_000_000
      ? `${(file.size / 1_000_000).toFixed(1)} MB`
      : `${Math.round(file.size / 1000)} KB`
    : failedSource === photo.src
      ? "Unavailable"
      : "Reading image…";
  if (!open) return null;
  return (
    <section
      aria-label="Photo information"
      tabIndex={0}
      data-photo-information=""
      {...stylex.props(s.infoPanel)}
    >
      <label htmlFor={captionId} {...stylex.props(s.visuallyHidden)}>
        Caption
      </label>
      <TextArea
        id={captionId}
        fullWidth
        rows={1}
        maxLength={500}
        placeholder="Add a Caption"
        value={caption}
        onChange={(event) => onCaptionChange(event.target.value)}
        xstyle={s.captionInput}
      />
      <div {...stylex.props(s.infoCard)}>
        <div {...stylex.props(s.infoFileHeading)}>
          <span>{photo.title}.jpg</span>
          <span {...stylex.props(s.secondary)}>
            {edited ? "Edited JPEG" : file?.type === "image/jpeg" ? "JPEG" : "Image"}
          </span>
        </div>
        <dl {...stylex.props(s.infoDetails)}>
          <div {...stylex.props(s.infoRow)}>
            <dt>Dimensions</dt>
            <dd {...stylex.props(s.infoValue)}>
              {photo.width} × {photo.height}
            </dd>
          </div>
          <div {...stylex.props(s.infoRow)}>
            <dt>Resolution</dt>
            <dd {...stylex.props(s.infoValue)}>{megapixels} MP</dd>
          </div>
          <div {...stylex.props(s.infoRow)}>
            <dt>File size</dt>
            <dd {...stylex.props(s.infoValue)}>{size}</dd>
          </div>
          <div {...stylex.props(s.infoRow)}>
            <dt>Collection</dt>
            <dd {...stylex.props(s.infoValue)}>{photo.collection}</dd>
          </div>
        </dl>
      </div>
      <p {...stylex.props(s.infoDescription)}>
        Unsplash sample. Capture date, camera details and location were not supplied.
      </p>
    </section>
  );
}
