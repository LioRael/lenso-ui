type Property = { name: string; source: { path: string } };
type Part = { name: string; properties: readonly number[] };

const inlineNativeProperties = new Set([
  "disabled",
  "onClick",
  "style",
  "render",
  "ref",
  "children",
  "id",
  "onKeyDown",
  "onKeyUp",
]);

function isInherited(row: Property) {
  return (
    /(?:@types\/react|@react-types\/shared\/src\/dom)\//.test(row.source.path) &&
    !inlineNativeProperties.has(row.name)
  );
}

export function groupApiProperties<P extends Part, R extends Property>(
  parts: readonly P[],
  properties: readonly R[],
) {
  const inheritedGroups: { id: number; rows: R[]; parts: string[] }[] = [];
  const groupsByProperties = new Map<string, (typeof inheritedGroups)[number]>();
  const sections = parts.map((part) => {
    const own: R[] = [];
    const inherited: R[] = [];
    const inheritedIds: number[] = [];
    for (const id of part.properties) {
      const row = properties[id];
      if (!row) throw new Error(`Unknown API property ${id} in ${part.name}`);
      if (isInherited(row)) {
        inherited.push(row);
        inheritedIds.push(id);
      } else {
        own.push(row);
      }
    }
    let group: (typeof inheritedGroups)[number] | undefined;
    if (inherited.length) {
      const key = inheritedIds.sort((a, b) => a - b).join(",");
      group = groupsByProperties.get(key);
      if (!group) {
        group = { id: inheritedGroups.length + 1, rows: inherited, parts: [] };
        groupsByProperties.set(key, group);
        inheritedGroups.push(group);
      }
      group.parts.push(part.name);
    }
    return { part, own, inherited: group };
  });
  return { sections, inheritedGroups };
}
