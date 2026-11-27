import { fieldsetStyles } from "@lenso/tokens/fieldset";
import { groupStyles } from "@lenso/tokens/surface";
import {
  FieldSet as SdkRoot,
  FieldLegend as SdkLegend,
  FieldGroup as SdkGroup,
  Field as SdkRow,
} from "@ui-sdk/vue/field";
import { fieldGroupScope } from "./field-group-context.js";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const FieldsetRoot: StyledPart<typeof SdkRoot> = fieldGroupScope(
  sdkPart(SdkRoot, "fieldset", () => fieldsetStyles.root),
  false,
);
export const FieldsetLegend: StyledPart<typeof SdkLegend> = sdkPart(
  SdkLegend,
  "fieldset-legend",
  () => fieldsetStyles.legend,
);
export const FieldsetGroup: StyledPart<typeof SdkGroup> = fieldGroupScope(
  sdkPart(SdkGroup, "fieldset-group", () => [
    groupStyles.surface,
    groupStyles.group,
    fieldsetStyles.group,
  ]),
  true,
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
