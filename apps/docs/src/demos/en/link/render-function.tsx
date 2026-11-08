"use client";
// Native anchor retained through Base UI render composition.
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
      Call to action
      <Link.Icon />
    </Link>
  );
}
