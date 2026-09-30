"use client";

// Adapted from HeroUI v3.2.6 drawer-backdrop-variants (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { Button, CloseIcon, Drawer } from "@lenso/ui";
import { styles } from "./styles";

export function BackdropVariants() {
  const variants = ["opaque", "blur", "transparent"] as const;
  return (
    <div {...stylex.props(styles.row)}>
      {variants.map((variant) => (
        <Drawer.Provider key={variant}>
          <Drawer swipeDirection="down">
            <Drawer.Trigger render={<Button variant="secondary" />}>
              {variant.charAt(0).toUpperCase() + variant.slice(1)}
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Backdrop variant={variant} />
              <Drawer.Viewport>
                <Drawer.Popup>
                  <Drawer.Content>
                    <Drawer.Handle />
                    <Drawer.Close
                      aria-label="Close drawer"
                      render={
                        <Button
                          isIconOnly
                          size="sm"
                          variant="tertiary"
                          xstyle={styles.cornerClose}
                        />
                      }
                    >
                      <CloseIcon />
                    </Drawer.Close>
                    <Drawer.Header>
                      <Drawer.Title>
                        Backdrop: {variant.charAt(0).toUpperCase() + variant.slice(1)}
                      </Drawer.Title>
                    </Drawer.Header>
                    <Drawer.Body>
                      <p>
                        This drawer uses the <code>{variant}</code> backdrop variant.
                      </p>
                    </Drawer.Body>
                    <Drawer.Footer>
                      <Drawer.Close render={<Button xstyle={styles.fullWidth} />}>
                        Close
                      </Drawer.Close>
                    </Drawer.Footer>
                  </Drawer.Content>
                </Drawer.Popup>
              </Drawer.Viewport>
            </Drawer.Portal>
          </Drawer>
        </Drawer.Provider>
      ))}
    </div>
  );
}
