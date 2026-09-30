"use client";
// Adapted from HeroUI v3.2.6 alert-dialog-custom-styles (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { AlertDialog, Button } from "@lenso/ui";

const styles = stylex.create({
  backdrop: {
    backgroundColor: {
      default: "color-mix(in oklab, var(--overlay) 50%, transparent)",
      ':where([data-theme="dark"]) &': "color-mix(in oklab, var(--overlay) 60%, transparent)",
    },
  },
  popup: {
    position: "relative",
    overflow: "hidden",
    maxWidth: 400,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: "color-mix(in oklab, var(--border) 80%, transparent)",
      ':where([data-theme="dark"]) &': "color-mix(in oklab, var(--border) 90%, transparent)",
    },
    backgroundColor: "var(--surface)",
    boxShadow: {
      default:
        "0 25px 50px -12px rgb(0 0 0 / 25%), 0 0 0 1px color-mix(in oklab, var(--accent) 10%, transparent)",
      ':where([data-theme="dark"]) &':
        "0 25px 50px -12px rgb(0 0 0 / 25%), 0 0 0 1px color-mix(in oklab, var(--accent) 15%, transparent)",
    },
  },
  glow: {
    pointerEvents: "none",
    position: "absolute",
    insetInline: 0,
    top: 0,
    height: 96,
    backgroundImage: {
      default:
        "linear-gradient(to bottom, color-mix(in oklab, var(--accent) 6%, transparent), transparent)",
      ':where([data-theme="dark"]) &':
        "linear-gradient(to bottom, color-mix(in oklab, var(--accent) 10%, transparent), transparent)",
    },
  },
  line: {
    pointerEvents: "none",
    position: "absolute",
    insetInline: 32,
    top: 0,
    height: 1,
    backgroundImage: {
      default:
        "linear-gradient(to right, transparent, color-mix(in oklab, var(--accent) 35%, transparent), transparent)",
      ':where([data-theme="dark"]) &':
        "linear-gradient(to right, transparent, color-mix(in oklab, var(--accent) 45%, transparent), transparent)",
    },
  },
  relative: { position: "relative" },
  caption: { color: "var(--muted)" },
  foreground: { color: "var(--foreground)" },
});

export function CustomStyles() {
  return (
    <AlertDialog>
      <AlertDialog.Trigger render={<Button variant="secondary" />}>Sign out</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop variant="blur" xstyle={styles.backdrop} />
        <AlertDialog.Viewport>
          <AlertDialog.Popup xstyle={styles.popup}>
            <div aria-hidden="true" {...stylex.props(styles.glow)} />
            <div aria-hidden="true" {...stylex.props(styles.line)} />
            <AlertDialog.Header xstyle={styles.relative}>
              <AlertDialog.Icon variant="accent" />
              <AlertDialog.Title>Sign out of your account?</AlertDialog.Title>
            </AlertDialog.Header>
            <AlertDialog.Body xstyle={styles.relative}>
              <AlertDialog.Description xstyle={styles.caption}>
                You will be signed out on this device. Unsaved work in{" "}
                <strong {...stylex.props(styles.foreground)}>Acme Workspace</strong> may be lost
                unless it was saved to the cloud.
              </AlertDialog.Description>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <AlertDialog.Close render={<Button variant="tertiary" />}>
                Stay signed in
              </AlertDialog.Close>
              <AlertDialog.Close render={<Button />}>Sign out</AlertDialog.Close>
            </AlertDialog.Footer>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
