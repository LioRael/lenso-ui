import { formStyles } from "@lenso/tokens/form";
import { htmlPart } from "./parts.js";

export const FormRoot = htmlPart("form", "form", () => formStyles.root);

export const Form = Object.assign(FormRoot, {
  Root: FormRoot,
});
