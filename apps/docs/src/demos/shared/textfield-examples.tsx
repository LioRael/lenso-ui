"use client";
import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { tokens } from "@lenso/tokens/tokens.stylex.const";
import { Button, Fieldset, TextArea, TextField } from "@lenso/ui";

export type TextFieldExampleKind =
  | "basic"
  | "controlled"
  | "disabled"
  | "full-width"
  | "input-types"
  | "on-surface"
  | "render-function"
  | "required"
  | "textarea"
  | "validation"
  | "with-description"
  | "with-error";
const s = stylex.create({
  scene: {
    boxSizing: "border-box",
    width: "100%",
    maxWidth: 402,
    minWidth: 0,

    color: tokens.labelPrimary,
  },
  wide: { maxWidth: "100%" },
  stack: { display: "flex", flexDirection: "column", gap: 20 },
  heading: {
    margin: 0,
    paddingInline: 16,
    fontSize: 13,
    lineHeight: "18px",
    color: "var(--docs-label-secondary, var(--lenso-label-secondary))",
    fontWeight: 400,
  },
  section: { display: "flex", flexDirection: "column", gap: 8 },
  note: {
    margin: 0,
    paddingInline: 16,
    fontSize: 13,
    lineHeight: "18px",
    color: "var(--docs-label-secondary, var(--lenso-label-secondary))",
  },
  error: { color: tokens.statusErrorText },
});

export function TextFieldExample({
  kind,
  locale,
}: {
  kind: TextFieldExampleKind;
  locale: "en" | "cn";
}) {
  const cn = locale === "cn";
  const [value, setValue] = useState(
    kind === "with-error" ? "Al" : kind === "controlled" ? "Alex" : "",
  );
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const helpId = useId();
  const clearLabel = cn ? "清除文本" : "Clear text";
  const invalid =
    (kind === "validation" || kind === "with-error") && value.length > 0 && value.length < 3;
  const names = cn ? ["姓名", "邮箱", "公司", "备注"] : ["Name", "Email", "Company", "Notes"];
  const row = (
    label: string,
    index: number,
    props: React.ComponentProps<typeof TextField.Input> = {},
  ) => (
    <TextField
      key={label}
      name={`field-${index}`}
      disabled={kind === "disabled" && index === 0}
      invalid={index === 0 && invalid}
      render={
        kind === "render-function"
          ? (props) => <div {...props} data-custom-field="true" />
          : undefined
      }
    >
      <TextField.Label>{label}</TextField.Label>
      <TextField.Input
        placeholder={cn ? "请输入…" : "Enter a value…"}
        clearLabel={clearLabel}
        {...props}
      />
    </TextField>
  );
  const grouped = (children: React.ReactNode, label = cn ? "文本输入" : "Text fields") => (
    <Fieldset aria-label={label}>
      <Fieldset.Group>{children}</Fieldset.Group>
    </Fieldset>
  );
  let content: React.ReactNode;
  if (
    kind === "basic" ||
    kind === "on-surface" ||
    kind === "full-width" ||
    kind === "render-function"
  ) {
    content = grouped(
      <>
        {row(names[0]!, 0)}
        {row(names[1]!, 1, { type: "email" })}
        {row(names[2]!, 2, { defaultValue: "Acme" })}
      </>,
    );
  } else if (kind === "disabled") {
    content = grouped(
      <>
        {row(names[0]!, 0, { defaultValue: cn ? "已禁用" : "Disabled" })}
        {row(names[1]!, 1, { defaultValue: "alex@example.com", readOnly: true })}
        {row(names[2]!, 2)}
      </>,
    );
  } else if (kind === "input-types") {
    content = grouped(
      <>
        {row(names[1]!, 0, { type: "email", autoComplete: "email" })}
        {row(cn ? "电话号码" : "Phone", 1, { type: "tel", autoComplete: "tel" })}
        {row(cn ? "密码" : "Password", 2, { type: "password", autoComplete: "new-password" })}
      </>,
    );
  } else if (kind === "textarea") {
    content = (
      <Fieldset aria-label={cn ? "详情" : "Details"}>
        <Fieldset.Group>
          {row(cn ? "标题" : "Title", 0)}
          <TextField name="notes" layout="stacked">
            <TextField.Label>{names[3]}</TextField.Label>
            <TextArea placeholder={cn ? "添加备注…" : "Add notes…"} rows={4} fullWidth />
          </TextField>
        </Fieldset.Group>
      </Fieldset>
    );
  } else {
    content = (
      <div {...stylex.props(s.section)}>
        {grouped(
          <>
            {row(names[0]!, 0, {
              value,
              onValueChange: setValue,
              required: kind === "required",
              "aria-describedby": helpId,
            })}
            {row(names[1]!, 1, {
              type: "email",
              required: kind === "required",
              ...(kind === "controlled" ? { value: note, onValueChange: setNote } : {}),
            })}
          </>,
        )}
        <p
          id={helpId}
          role={invalid ? "alert" : undefined}
          {...stylex.props(s.note, invalid && s.error)}
        >
          {invalid
            ? cn
              ? "姓名至少需要 3 个字符。"
              : "Use at least 3 characters for the name."
            : kind === "controlled"
              ? cn
                ? `已输入 ${value.length} 个字符`
                : `${value.length} characters entered`
              : kind === "required"
                ? cn
                  ? "姓名和邮箱均为必填项。"
                  : "Name and email are required."
                : cn
                  ? "此信息仅用于你的个人资料。"
                  : "This information is used for your profile."}
        </p>
      </div>
    );
  }
  return (
    <div data-textfield-example={kind} {...stylex.props(s.scene, kind === "full-width" && s.wide)}>
      <form
        {...stylex.props(s.stack)}
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        {content}
        {kind === "required" && (
          <>
            <Button type="submit">{cn ? "保存" : "Save"}</Button>
            <output aria-live="polite" {...stylex.props(s.note)}>
              {submitted ? (cn ? "已保存示例资料" : "Example details saved") : ""}
            </output>
          </>
        )}
      </form>
    </div>
  );
}
