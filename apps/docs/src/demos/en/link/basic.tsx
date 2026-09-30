"use client";

import { Link } from "@lenso/ui";

export function LinkBasic() {
  return (
    <Link href="#">
      Call to action <Link.Icon aria-hidden="true" />
    </Link>
  );
}
