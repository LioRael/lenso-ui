import InputGroupRoot from "./input-group-root.svelte";
import InputGroupInput from "./input-group-input.svelte";
import InputGroupPrefix from "./input-group-prefix.svelte";
import InputGroupSuffix from "./input-group-suffix.svelte";
import InputGroupTextArea from "./input-group-text-area.svelte";

export { InputGroupRoot, InputGroupInput, InputGroupPrefix, InputGroupSuffix, InputGroupTextArea };
export const InputGroup: typeof InputGroupRoot & {
  TextArea: typeof InputGroupTextArea;
  Root: typeof InputGroupRoot;
  Input: typeof InputGroupInput;
  Prefix: typeof InputGroupPrefix;
  Suffix: typeof InputGroupSuffix;
} = Object.assign(InputGroupRoot, {
  TextArea: InputGroupTextArea,
  Root: InputGroupRoot,
  Input: InputGroupInput,
  Prefix: InputGroupPrefix,
  Suffix: InputGroupSuffix,
});
