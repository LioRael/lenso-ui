"use client";
// HeroUI v3.2.6, Apache-2.0. Behavior uses Base UI's native Form contract.
import { Form as BaseForm } from "@base-ui/react/form";
import { formStyles } from "@lenso/tokens/form";
import { styledPart } from "../../utils/styled.js";
export const FormRoot = styledPart(BaseForm, "form", formStyles.root);
export const Form = Object.assign(FormRoot, { Root: FormRoot });
export type FormRootProps = React.ComponentProps<typeof FormRoot>;
export type FormProps = FormRootProps;
