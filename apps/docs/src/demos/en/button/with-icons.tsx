"use client";
// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Envelope, Globe, Plus, TrashBin } from "@gravity-ui/icons";
import { Button } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./source.stylex";
export function WithIcons() {
  return (
    <div {...stylex.props(styles.row)}>
      <Button>
        <Button.Icon>
          <Globe />
        </Button.Icon>
        Search
      </Button>
      <Button variant="secondary">
        <Button.Icon>
          <Plus />
        </Button.Icon>
        Add Member
      </Button>
      <Button variant="tertiary">
        <Button.Icon>
          <Envelope />
        </Button.Icon>
        Email
      </Button>
      <Button variant="danger">
        <Button.Icon>
          <TrashBin />
        </Button.Icon>
        Delete
      </Button>
    </div>
  );
}
