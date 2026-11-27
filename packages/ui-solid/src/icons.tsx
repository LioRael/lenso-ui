import { iconShapes } from "@lenso/tokens/icons";
import type { JSX } from "@solidjs/web";

export type IconProps = JSX.IntrinsicElements["svg"];
function icon({ path, size, viewBox }: (typeof iconShapes)[keyof typeof iconShapes]) {
  return function Icon(props: IconProps): JSX.Element {
    return (
      <svg
        aria-hidden="true"
        role="presentation"
        fill="none"
        height={size}
        width={size}
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path d={path} fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" />
      </svg>
    );
  };
}
export const IconChevronDown = icon(iconShapes.IconChevronDown);
export const IconChevronUp = icon(iconShapes.IconChevronUp);
export const IconChevronLeft = icon(iconShapes.IconChevronLeft);
export const IconChevronRight = icon(iconShapes.IconChevronRight);
export const ExternalLinkIcon = icon(iconShapes.ExternalLinkIcon);
export const CircleDashedIcon = icon(iconShapes.CircleDashedIcon);
export const CloseIcon = icon(iconShapes.CloseIcon);
export const InfoIcon = icon(iconShapes.InfoIcon);
export const WarningIcon = icon(iconShapes.WarningIcon);
export const DangerIcon = icon(iconShapes.DangerIcon);
export const SuccessIcon = icon(iconShapes.SuccessIcon);
export const IconMinus = icon(iconShapes.IconMinus);
export const IconPlus = icon(iconShapes.IconPlus);
export const IconSearch = icon(iconShapes.IconSearch);
export const IconCalendar = icon(iconShapes.IconCalendar);
