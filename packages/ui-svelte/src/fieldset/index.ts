import FieldsetRoot from "./fieldset-root.svelte";
import FieldsetLegend from "./fieldset-legend.svelte";
import FieldsetGroup from "./fieldset-group.svelte";
import FieldsetRow from "./fieldset-row.svelte";
import FieldsetActions from "./fieldset-actions.svelte";

export { FieldsetRoot, FieldsetLegend, FieldsetGroup, FieldsetRow, FieldsetActions };
export const Fieldset: typeof FieldsetRoot & {
  Root: typeof FieldsetRoot;
  Legend: typeof FieldsetLegend;
  Group: typeof FieldsetGroup;
  Row: typeof FieldsetRow;
  Actions: typeof FieldsetActions;
} = Object.assign(FieldsetRoot, {
  Root: FieldsetRoot,
  Legend: FieldsetLegend,
  Group: FieldsetGroup,
  Row: FieldsetRow,
  Actions: FieldsetActions,
});

export const FieldGroup: typeof Fieldset.Group = Fieldset.Group;
