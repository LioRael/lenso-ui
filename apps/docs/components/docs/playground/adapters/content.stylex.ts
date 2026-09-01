import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  contentState: { maxWidth: "520px" },
  descriptionList: { maxWidth: "520px" },
  inlineAlert: { maxWidth: "560px" },
  slider: { width: "240px" },
  surfaceDemo: { height: "198px", width: "360px" },
  surfaceTitle: {
    fontFamily: '"IBM Plex Sans", sans-serif',
    fontSize: "16px",
    fontWeight: 600,
    margin: 0,
  },
  surfaceDescription: {
    color: "var(--color-content-secondary)",
    fontFamily: '"IBM Plex Sans", sans-serif',
    fontSize: "13px",
    lineHeight: "normal",
    margin: 0,
  },
});
