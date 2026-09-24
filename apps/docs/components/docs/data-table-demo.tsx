"use client";

import { DataTable, type DataTableColumn } from "@lenso/ui/data-table";

const columns: readonly DataTableColumn[] = [
  { id: "project", width: 240, minWidth: 160, pinned: true },
  { id: "owner", width: 160 },
  { id: "status", width: 140 },
  { id: "updated", width: 160 },
];

const projects = [
  { name: "Console refresh", owner: "Design team", status: "In progress", updated: "Sep 23, 2026" },
  { name: "Agent profiles", owner: "Platform", status: "Review", updated: "Sep 21, 2026" },
  { name: "Plugin directory", owner: "Ecosystem", status: "In progress", updated: "Sep 18, 2026" },
  { name: "Onboarding", owner: "Growth", status: "Complete", updated: "Sep 16, 2026" },
] as const;

export function DataTableDemo() {
  return (
    <DataTable.Root columns={columns} label="Projects" maxHeight={360}>
      <DataTable.Header>
        <DataTable.Row>
          <DataTable.Head columnId="project" resizable resizeLabel="Resize Project column">
            Project
          </DataTable.Head>
          <DataTable.Head columnId="owner">Owner</DataTable.Head>
          <DataTable.Head columnId="status">Status</DataTable.Head>
          <DataTable.Head columnId="updated">Updated</DataTable.Head>
        </DataTable.Row>
      </DataTable.Header>
      <DataTable.Body>
        {projects.map((project) => (
          <DataTable.Row key={project.name}>
            <DataTable.Cell columnId="project">{project.name}</DataTable.Cell>
            <DataTable.Cell columnId="owner">{project.owner}</DataTable.Cell>
            <DataTable.Cell columnId="status">{project.status}</DataTable.Cell>
            <DataTable.Cell columnId="updated" muted>
              {project.updated}
            </DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable.Body>
      <DataTable.Footer>
        <DataTable.Row>
          <DataTable.Cell columnId="project">{projects.length} projects</DataTable.Cell>
          <DataTable.Cell columnId="owner" />
          <DataTable.Cell columnId="status" />
          <DataTable.Cell columnId="updated" />
        </DataTable.Row>
      </DataTable.Footer>
    </DataTable.Root>
  );
}
