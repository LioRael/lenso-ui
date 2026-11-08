import * as stylex from "@stylexjs/stylex";
import { pageUrl, type DocPage } from "@/lib/source";
import { gallery } from "@/styles/component-gallery.stylex";

// Apache-2.0.

export function ComponentsCategory({ pages }: { pages: DocPage[] }) {
  return (
    <div data-component-gallery="" {...stylex.props(gallery.grid)}>
      {pages.map((page) => (
        <a key={page.slug} href={pageUrl(page)} {...stylex.props(gallery.item)}>
          <span {...stylex.props(gallery.title)}>{page.title}</span>
          <span {...stylex.props(gallery.description)}>{page.description}</span>
        </a>
      ))}
    </div>
  );
}
