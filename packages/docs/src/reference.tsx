import type { ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles, prose } from "../dist/presentation.js";

export interface ComponentExampleProps {
  title: string;
  children: ReactNode;
  code?: ReactNode;
}

export function ComponentExample({ title, children, code }: ComponentExampleProps) {
  return (
    <section aria-label={title} {...stylex.props(styles.callout)}>
      {children}
      {code == null ? null : <section aria-label={`${title} code example`}>{code}</section>}
    </section>
  );
}

export interface ReferenceTableRow {
  name: string;
  type: string;
  required?: boolean;
  default?: string;
  description?: ReactNode;
}

export interface ReferenceTableLabels {
  name?: string;
  type?: string;
  required?: string;
  default?: string;
  description?: string;
  yes?: string;
  no?: string;
}

export interface ReferenceTableProps {
  title: string;
  rows: readonly ReferenceTableRow[];
  labels?: ReferenceTableLabels;
}

export function ReferenceTable({ title, rows, labels = {} }: ReferenceTableProps) {
  const names = new Set<string>();
  for (const row of rows) {
    if (names.has(row.name)) {
      throw new Error(`ReferenceTable row names must be unique: "${row.name}"`);
    }
    names.add(row.name);
  }

  const columns = [
    [labels.name ?? "Name", "name"],
    [labels.type ?? "Type", "type"],
    [labels.required ?? "Required", "required"],
    [labels.default ?? "Default", "default"],
    [labels.description ?? "Description", "description"],
  ] as const;

  return (
    // Safari needs tabindex for a scroll container to be reachable by keyboard.
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <section aria-label={title} tabIndex={0} {...stylex.props(prose.scroll)}>
      <table {...stylex.props(prose.table)}>
        <caption>{title}</caption>
        <thead>
          <tr>
            {columns.map(([label, field]) => (
              <th key={field} scope="col" {...stylex.props(prose.cell, prose.header)}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <th scope="row" {...stylex.props(prose.cell)}>
                <code {...stylex.props(prose.code)}>{row.name}</code>
              </th>
              <td {...stylex.props(prose.cell)}>
                <code {...stylex.props(prose.code)}>{row.type}</code>
              </td>
              <td {...stylex.props(prose.cell)}>
                {row.required === undefined
                  ? ""
                  : row.required
                    ? (labels.yes ?? "Yes")
                    : (labels.no ?? "No")}
              </td>
              <td {...stylex.props(prose.cell)}>
                {row.default === undefined ? (
                  ""
                ) : (
                  <code {...stylex.props(prose.code)}>{row.default}</code>
                )}
              </td>
              <td {...stylex.props(prose.cell)}>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export interface ApiOperationProps {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
  path: string;
  children: ReactNode;
  summary?: string;
}

export function ApiOperation({ method, path, children, summary }: ApiOperationProps) {
  const label = `${method} ${path}`;
  return (
    <section aria-label={label} {...stylex.props(styles.callout)}>
      <p>
        <span {...stylex.props(styles.inlineCode)}>{method}</span>{" "}
        <code {...stylex.props(prose.code)}>{path}</code>
      </p>
      {summary == null ? null : <p>{summary}</p>}
      <div>{children}</div>
    </section>
  );
}

export interface ApiResponse {
  status: number;
  description: ReactNode;
  body?: ReactNode;
}

export interface ApiResponsesProps {
  responses: readonly ApiResponse[];
}

export function ApiResponses({ responses }: ApiResponsesProps) {
  const statuses = new Set<number>();
  for (const response of responses) {
    if (statuses.has(response.status)) {
      throw new Error(`ApiResponses status codes must be unique: ${response.status}`);
    }
    statuses.add(response.status);
  }

  return (
    <section aria-label="API responses">
      <ul>
        {responses.map(({ status, description, body }) => (
          <li key={status}>
            <section aria-label={`Response ${status}`} {...stylex.props(styles.callout)}>
              <p>
                <code {...stylex.props(prose.code)}>{status}</code>
              </p>
              <div>{description}</div>
              {body == null ? null : <div>{body}</div>}
            </section>
          </li>
        ))}
      </ul>
    </section>
  );
}
