import { Code, LogoGithub } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { notebook } from "@/styles/notebook.stylex";
import { FigmaIcon, ReactAriaIcon, StorybookIcon } from "./upstream-reference-icons";

const pinned = "https://github.com/heroui-inc/heroui/blob/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e";
interface Links {
  figma?: boolean;
  storybook?: string;
  rac?: string;
  radix?: string;
  source?: string;
  styles?: string;
  themes?: string;
  tailwind?: string;
}

// Upstream reference links stay upstream; they do not describe the local Base UI API.
export function ComponentLinks({ links }: { links?: Links }) {
  if (!links) return null;
  const entries = [
    links.figma && {
      label: "Figma",
      href: "https://www.figma.com/community/file/1546526812159103429",
      icon: FigmaIcon,
    },
    links.storybook && {
      label: "Storybook",
      href: `https://storybook.heroui.com/?path=/docs/${links.storybook.toLowerCase().replace(/[^a-z0-9]+/g, "-")}--docs`,
      icon: StorybookIcon,
    },
    links.rac && {
      label: "React Aria",
      href: `https://react-aria.adobe.com/${links.rac}`,
      icon: ReactAriaIcon,
    },
    links.radix && {
      label: "Radix UI",
      href: `https://www.radix-ui.com/primitives/docs/components/${links.radix}`,
      icon: Code,
    },
    links.source && {
      label: "Source",
      href: `${pinned}/packages/react/src/components/${links.source}`,
      icon: LogoGithub,
    },
    links.styles && {
      label: "Styles source",
      href: `${pinned}/packages/styles/components/${links.styles}`,
      icon: LogoGithub,
    },
    links.themes && {
      label: "Theme source",
      href: `${pinned}/packages/styles/themes`,
      icon: LogoGithub,
    },
    links.tailwind && {
      label: "Tailwind CSS",
      href: `https://tailwindcss.com/docs/${links.tailwind}`,
      icon: Code,
    },
  ].filter((entry) => !!entry);
  return (
    <nav aria-label="Upstream component references" {...stylex.props(notebook.sourceLinks)}>
      {entries.map(({ label, href, icon: Icon }) => (
        <a
          key={label}
          href={href}
          title={`Upstream HeroUI reference: ${label}`}
          target="_blank"
          rel="noreferrer noopener"
          {...stylex.props(notebook.sourceLink)}
        >
          <Icon width={16} height={16} aria-hidden="true" /> {label}
        </a>
      ))}
    </nav>
  );
}
