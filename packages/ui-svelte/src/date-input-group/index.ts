import DateInputGroupInputContainer from "./date-input-group-input-container.svelte";
export { DateInputGroupInputContainer };
import DateInputGroupRoot from "./date-input-group-root.svelte";
import DateInputGroupInput from "./date-input-group-input.svelte";
import DateInputGroupSegment from "./date-input-group-segment.svelte";
import DateInputGroupPrefix from "./date-input-group-prefix.svelte";
import DateInputGroupSuffix from "./date-input-group-suffix.svelte";

export {
  DateInputGroupRoot,
  DateInputGroupInput,
  DateInputGroupSegment,
  DateInputGroupPrefix,
  DateInputGroupSuffix,
};
export const DateInputGroup: typeof DateInputGroupRoot & {
  InputContainer: typeof DateInputGroupInputContainer;
  Root: typeof DateInputGroupRoot;
  Input: typeof DateInputGroupInput;
  Segment: typeof DateInputGroupSegment;
  Prefix: typeof DateInputGroupPrefix;
  Suffix: typeof DateInputGroupSuffix;
} = Object.assign(DateInputGroupRoot, {
  InputContainer: DateInputGroupInputContainer,
  Root: DateInputGroupRoot,
  Input: DateInputGroupInput,
  Segment: DateInputGroupSegment,
  Prefix: DateInputGroupPrefix,
  Suffix: DateInputGroupSuffix,
});
