import { fieldsetStyles } from "@lenso/tokens/fieldset";
import { groupStyles } from "@lenso/tokens/surface";
import {
  FieldSet as SdkRoot,
  FieldLegend as SdkLegend,
  FieldGroup as SdkGroup,
  Field as SdkRow,
} from "@ui-sdk/solid/field";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const FieldsetRoot: StyledPart<typeof SdkRoot> = sdkPart(
  SdkRoot,
  "fieldset",
  () => fieldsetStyles.root,
);
export const FieldsetLegend: StyledPart<typeof SdkLegend> = sdkPart(
  SdkLegend,
  "fieldset-legend",
  () => fieldsetStyles.legend,
);
export const FieldsetGroup: StyledPart<typeof SdkGroup> = sdkPart(
  SdkGroup,
  "fieldset-group",
  () => [groupStyles.surface, groupStyles.group, fieldsetStyles.group],
);
export const FieldsetRow: StyledPart<typeof SdkRow> = sdkPart(SdkRow, "fieldset-row", () => [
  groupStyles.row,
  groupStyles.divided,
  groupStyles.fieldFocus,
  fieldsetStyles.row,
]);
export const FieldsetActions = htmlPart("div", "fieldset-actions", () => fieldsetStyles.actions);

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
