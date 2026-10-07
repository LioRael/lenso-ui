import * as stylex from "@stylexjs/stylex";
import { pageUrl, type DocPage } from "@/lib/source";
import { gallery } from "@/styles/component-gallery.stylex";

// Adapted from HeroUI v3.2.6 components-category.tsx and component-item.tsx.
// Apache-2.0. Reference thumbnails are not local runnable-demo evidence.
const thumbnails = "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/related-components";

export function ComponentsCategory({ pages }: { pages: DocPage[] }) {
  return (
    <div data-component-gallery="" {...stylex.props(gallery.grid)}>
      {pages.map((page) => (
        <a key={page.slug} href={pageUrl(page)} {...stylex.props(gallery.item)}>
          <span {...stylex.props(gallery.title)}>{page.title}</span>
          {page.componentThumbnail ? (
            <span {...stylex.props(gallery.preview)}>
              {(["light", "dark"] as const).map((theme) => (
                <img
                  key={theme}
                  src={`${thumbnails}/${theme}-${page.componentThumbnail}.png`}
                  alt=""
                  width={874}
                  height={594}
                  loading="lazy"
                  {...stylex.props(gallery.image, gallery[theme])}
                />
              ))}
            </span>
          ) : (
            <span {...stylex.props(gallery.description)}>{page.description}</span>
          )}
        </a>
      ))}
    </div>
  );
}
