import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { DemoPhoto } from "../lib/photos-library";
import { photos as s } from "../styles/photos-demo.stylex";

export function PhotoImage({
  photo,
  full = false,
  filter,
}: {
  photo: DemoPhoto;
  full?: boolean;
  filter?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  return (
    <span {...stylex.props(s.imageFrame, full && s.fullImageFrame)}>
      {!loaded && (
        <span {...stylex.props(s.imageStatus)}>
          {failed ? "Photo unavailable" : "Loading photo…"}
        </span>
      )}
      {!failed && (
        <img
          src={full ? photo.src : photo.thumb}
          alt={photo.title}
          draggable={false}
          loading={full ? "eager" : "lazy"}
          ref={(image) => {
            if (image?.complete && image.naturalWidth > 0) setLoaded(true);
          }}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          {...stylex.props(s.image, full && s.fullImage, filter ? s.imageFilter(filter) : null)}
        />
      )}
    </span>
  );
}
