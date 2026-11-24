import { spinnerColors, spinnerSizes, spinnerStyles } from "@lenso/tokens/spinner";
import * as stylex from "@stylexjs/stylex";
import { For, omit, type ComponentProps } from "solid-js";
import { htmlPart } from "./parts.js";

const Root = htmlPart<
  "output",
  { size?: keyof typeof spinnerSizes; color?: keyof typeof spinnerColors }
>(
  "output",
  "spinner",
  (props) => [
    spinnerStyles.root,
    spinnerSizes[props.size ?? "md"],
    spinnerColors[props.color ?? "secondary"],
  ],
  "size",
  "color",
);

export type SpinnerProps = ComponentProps<typeof Root>;

export function SpinnerRoot(props: SpinnerProps) {
  const small = () => props.size === "sm";
  const dimension = () => (small() ? 22 : 30);
  const thickness = () => (small() ? 3 : 4);
  return (
    <Root aria-label="Loading" {...omit(props, "children")}>
      <svg
        {...stylex.attrs(spinnerStyles.icon)}
        aria-hidden="true"
        viewBox={`0 0 ${dimension()} ${dimension()}`}
      >
        {/* Geometry follows Apple 40:58300 / 40:58436; timing is a Web adaptation. */}
        <For each={[0, 1, 2, 3, 4, 5, 6, 7]}>
          {(index) => (
            <rect
              x={(dimension() - thickness()) / 2}
              y={0}
              width={thickness()}
              height={small() ? 7 : 10}
              rx={thickness() / 2}
              fill="currentColor"
              opacity={1 - index * 0.12}
              transform={`rotate(${index * 45} ${dimension() / 2} ${dimension() / 2})`}
            />
          )}
        </For>
      </svg>
    </Root>
  );
}

export const Spinner = Object.assign(SpinnerRoot, { Root: SpinnerRoot });
