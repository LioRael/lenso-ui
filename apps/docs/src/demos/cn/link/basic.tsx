"use client";

import { Link } from "@lenso/ui";
export function LinkBasic() {
  return (
    <Link href="#">
      立即行动
      <Link.Icon aria-hidden="true" />
    </Link>
  );
}
