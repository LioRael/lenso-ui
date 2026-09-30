/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for Lenso StyleX. */
import type { ComponentProps } from "react";
import {
  DateInputGroupRoot,
  DateInputGroupInput,
  DateInputGroupSegment,
  DateInputGroupInputContainer,
  DateInputGroupPrefix,
  DateInputGroupSuffix,
} from "./date-input-group.js";
export {
  DateInputGroupRoot,
  DateInputGroupInput,
  DateInputGroupSegment,
  DateInputGroupInputContainer,
  DateInputGroupPrefix,
  DateInputGroupSuffix,
};
export type {
  DateInputGroupRootProps,
  DateInputGroupRootProps as DateInputGroupProps,
} from "./date-input-group.js";
export type DateInputGroupInputProps = ComponentProps<typeof DateInputGroupInput>;
export type DateInputGroupSegmentProps = ComponentProps<typeof DateInputGroupSegment>;
export type DateInputGroupInputContainerProps = ComponentProps<typeof DateInputGroupInputContainer>;
export type DateInputGroupPrefixProps = ComponentProps<typeof DateInputGroupPrefix>;
export type DateInputGroupSuffixProps = ComponentProps<typeof DateInputGroupSuffix>;
export const DateInputGroup = Object.assign(DateInputGroupRoot, {
  Root: DateInputGroupRoot,
  Input: DateInputGroupInput,
  Segment: DateInputGroupSegment,
  InputContainer: DateInputGroupInputContainer,
  Prefix: DateInputGroupPrefix,
  Suffix: DateInputGroupSuffix,
});
