import path from "node:path";

// Development must not read dist while another session cleans or rebuilds it.
export function workspaceAliases(root: string) {
  const file = (relative: string) => path.resolve(root, "../..", relative);
  return [
    {
      find: /^@lenso\/primitives\/command$/,
      replacement: file("packages/primitives/src/command/index.ts"),
    },
    {
      find: "../dist/fonts/Inter-Variable.ttf",
      replacement: file("packages/docs/assets/fonts/Inter-Variable.ttf"),
    },
    { find: /^@lenso\/ui$/, replacement: file("packages/ui/src/index.ts") },
    { find: /^@lenso\/ui\/hooks$/, replacement: file("packages/ui/src/hooks/index.ts") },
    { find: /^@lenso\/ui\/icons$/, replacement: file("packages/ui/src/icons/index.tsx") },
    { find: /^@lenso\/ui\/(.+)$/, replacement: file("packages/ui/src/components/$1/index.ts") },
    {
      find: /^@lenso\/tokens\/(?:theme|styles)\.css$/,
      replacement: file("packages/tokens/styles.css"),
    },
    { find: /^@lenso\/tokens$/, replacement: file("packages/tokens/src/index.ts") },
    {
      find: /^@lenso\/tokens\/materials$/,
      replacement: file("packages/tokens/src/materials/index.ts"),
    },
    {
      find: /^@lenso\/tokens\/tokens\.stylex\.const$/,
      replacement: file("packages/tokens/src/tokens.stylex.const.ts"),
    },
    {
      find: /^@lenso\/tokens\/(.+)$/,
      replacement: file("packages/tokens/src/components/$1/index.ts"),
    },
    { find: /^@lenso\/glass$/, replacement: file("packages/glass/src/index.ts") },
    {
      find: /^@lenso\/glass\/(react|motion)$/,
      replacement: file("packages/glass/src/$1/index.ts"),
    },
    ...["react", "client", "source"].map((entry) => ({
      find: new RegExp(`^@lenso/docs/${entry}$`),
      replacement: file(`packages/docs/src/${entry}.ts`),
    })),
    {
      find: /^@lenso\/docs\/presentation$/,
      replacement: file("packages/docs/presentation/index.ts"),
    },
    ...["tabs", "toc", "highlight"].map((entry) => ({
      find: new RegExp(`^@lenso/docs/${entry}$`),
      replacement: file(`packages/docs/presentation/${entry}.tsx`),
    })),
    { find: /^@lenso\/docs\/fonts\/(.+)$/, replacement: file("packages/docs/assets/fonts/$1") },
  ];
}
