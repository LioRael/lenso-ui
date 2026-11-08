"use client";
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
      <Button variant="bordered">
        <Button.Icon>
          <Plus />
        </Button.Icon>
        Add Member
      </Button>
      <Button variant="bordered">
        <Button.Icon>
          <Envelope />
        </Button.Icon>
        Email
      </Button>
      <Button destructive variant="prominent">
        <Button.Icon>
          <TrashBin />
        </Button.Icon>
        Delete
      </Button>
    </div>
  );
}
