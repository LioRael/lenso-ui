"use client";
import { Separator } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const items = [
  {
    iconUrl: "/assets/demo/illustrations/bell-small.svg",
    subtitle: "Receive account activity updates",
    title: "Set Up Notifications",
  },
  {
    iconUrl: "/assets/demo/illustrations/compass-small.svg",
    subtitle: "Connect your browser to your account",
    title: "Set up Browser Extension",
  },
  {
    iconUrl: "/assets/demo/illustrations/mint-collective-small.svg",
    subtitle: "Create your first collectible",
    title: "Mint Collectible",
  },
];
const styles = stylex.create({
  column: { display: "flex", maxWidth: 448, flexDirection: "column", gap: 16 },
  row: { display: "flex", alignItems: "center", gap: 12 },
  image: { width: 48, height: 48 },
  text: { flex: 1 },
  title: { fontSize: 14, lineHeight: "20px", fontWeight: 500 },
  subtitle: { fontSize: 14, lineHeight: "20px", color: "var(--lenso-label-secondary)" },
  separator: { marginBlock: 16 },
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
