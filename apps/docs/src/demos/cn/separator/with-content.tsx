// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Separator } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const items = [
  {
    iconUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/3dicons/bell-small.png",
    subtitle: "Receive account activity updates",
    title: "设置通知",
  },
  {
    iconUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/3dicons/compass-small.png",
    subtitle: "Connect your browser to your account",
    title: "设置浏览器扩展",
  },
  {
    iconUrl:
      "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/3dicons/mint-collective-small.png",
    subtitle: "Create your first collectible",
    title: "铸造收藏品",
  },
];
const styles = stylex.create({
  column: {
    display: "flex",
    maxWidth: 448,
    flexDirection: "column",
    gap: 16,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  image: {
    width: 48,
    height: 48,
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    lineHeight: "20px",
    fontWeight: 500,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: "20px",
    color: "var(--muted)",
  },
  separator: {
    marginBlock: 16,
  },
});
export function WithContent() {
  return (
    <div {...stylex.props(styles.column)}>
      {items.map((item, index) => (
        <div key={item.title}>
          <div {...stylex.props(styles.row)}>
            <img alt={item.title} {...stylex.props(styles.image)} src={item.iconUrl} />
            <div {...stylex.props(styles.text)}>
              <h4 {...stylex.props(styles.title)}>{item.title}</h4>
              <p {...stylex.props(styles.subtitle)}>{item.subtitle}</p>
            </div>
          </div>
          {index < items.length - 1 && <Separator xstyle={styles.separator} />}
        </div>
      ))}
    </div>
  );
}
export default WithContent;
