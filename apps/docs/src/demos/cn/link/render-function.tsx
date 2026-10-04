// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0. Native anchor retained through Base UI render composition.
import { Link } from "@lenso/ui";
export function RenderFunction() {
  return (
    <Link
      href="#"
      render={(props) => (
        <a {...props} data-custom="foo">
          {props.children}
        </a>
      )}
    >
      立即行动
      <Link.Icon />
    </Link>
  );
}
