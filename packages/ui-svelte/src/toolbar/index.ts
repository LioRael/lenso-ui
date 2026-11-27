import ToolbarRoot from "./toolbar-root.svelte";
import ToolbarButton from "./toolbar-button.svelte";
import ToolbarLink from "./toolbar-link.svelte";
import ToolbarInput from "./toolbar-input.svelte";
import ToolbarGroup from "./toolbar-group.svelte";
import ToolbarSeparator from "./toolbar-separator.svelte";

export { ToolbarRoot, ToolbarButton, ToolbarLink, ToolbarInput, ToolbarGroup, ToolbarSeparator };
export const Toolbar: typeof ToolbarRoot & {
  Root: typeof ToolbarRoot;
  Button: typeof ToolbarButton;
  Link: typeof ToolbarLink;
  Input: typeof ToolbarInput;
  Group: typeof ToolbarGroup;
  Separator: typeof ToolbarSeparator;
} = Object.assign(ToolbarRoot, {
  Root: ToolbarRoot,
  Button: ToolbarButton,
  Link: ToolbarLink,
  Input: ToolbarInput,
  Group: ToolbarGroup,
  Separator: ToolbarSeparator,
});
