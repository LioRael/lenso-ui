import type { ComponentPropsWithoutRef } from "react";

export default function MockNextLink({
  children,
  href,
  onClick,
  ...props
}: ComponentPropsWithoutRef<"a">) {
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        event.preventDefault();
      }}
    >
      {children}
    </a>
  );
}
