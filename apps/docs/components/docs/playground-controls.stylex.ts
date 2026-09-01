import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  root: { width: "328px" },
  header: {
    alignItems: "center",
    display: "flex",
    height: "32px",
    justifyContent: "space-between",
    width: "328px",
  },
  headerTitle: {
    color: "var(--color-content-primary)",
    fontSize: "11px",
    fontWeight: 500,
    lineHeight: "18px",
  },
  divider: {
    backgroundColor: "var(--color-border-translucent)",
    height: "0.5px",
    marginBlock: "4px",
    width: "328px",
  },
  list: { display: "flex", flexDirection: "column", gap: "4px" },
  row: {
    alignItems: "center",
    display: "flex",
    height: "28px",
    justifyContent: "space-between",
    width: "328px",
  },
  label: {
    color: "var(--color-content-secondary)",
    fontSize: "11px",
    fontWeight: 400,
    lineHeight: "18px",
  },
  selectTrigger: {
    color: "var(--color-content-secondary)",
    fontSize: "11px",
    height: "28px",
    justifyContent: "space-between",
    lineHeight: "18px",
    paddingInline: "10px",
    width: "164px",
  },
  selectPopup: { height: "auto", maxHeight: "224px", minWidth: "164px", width: "164px" },
  selectItem: {
    color: "var(--color-content-secondary)",
    fontFamily: '"IBM Plex Sans", var(--font-sans)',
    fontSize: "11px",
    fontWeight: 400,
    height: "28px",
    lineHeight: "18px",
  },
  textField: { display: "block", maxWidth: "none", width: "164px" },
  textControl: {
    color: "var(--color-content-secondary)",
    fontSize: "11px",
    height: "28px",
    lineHeight: "18px",
    padding: "5px 10px",
  },
});
