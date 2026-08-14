import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { chromium, type Page } from "playwright";

const repositoryRoot = path.resolve(import.meta.dirname, "../../..");
const packageManagerPath = process.env.npm_execpath;
if (!packageManagerPath) throw new Error("npm_execpath is required to run release smoke tests");
const packageManager: string = packageManagerPath;

function runPnpm(args: string[], cwd: string): string {
  const result = spawnSync(process.execPath, [packageManager, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, CI: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status !== 0) {
    throw new Error(
      [`pnpm ${args.join(" ")} failed in ${cwd}`, result.stdout, result.stderr].join("\n"),
    );
  }
  return result.stdout.trim();
}

async function writeProjectFile(root: string, file: string, content: string) {
  const target = path.join(root, file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content);
}

async function availablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") return reject(new Error("No test port"));
      server.close(() => resolve(address.port));
    });
  });
}

async function verifyInChromium(
  cwd: string,
  command: string[],
  verify: (page: Page) => Promise<void>,
) {
  const port = await availablePort();
  const executable = command[0];
  if (!executable) throw new Error("A preview executable is required");
  const child = spawn(process.execPath, [executable, ...command.slice(1), String(port)], {
    cwd,
    env: { ...process.env, CI: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const origin = `http://127.0.0.1:${port}`;
  try {
    let ready = false;
    for (let attempt = 0; attempt < 120; attempt += 1) {
      if (child.exitCode != null) throw new Error(`Preview exited early with ${child.exitCode}`);
      try {
        const response = await fetch(origin);
        if (response.ok) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    if (!ready) throw new Error(`Preview did not become ready: ${origin}`);
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.goto(origin);
      await verify(page);
    } finally {
      await browser.close();
    }
  } finally {
    child.kill("SIGTERM");
  }
}

async function pack(packageName: string, destination: string): Promise<string> {
  const output = runPnpm(
    ["--filter", packageName, "pack", "--pack-destination", destination],
    repositoryRoot,
  );
  const tarball = output.split("\n").at(-1);
  if (!tarball?.endsWith(".tgz")) throw new Error(`Could not find tarball in: ${output}`);
  return path.isAbsolute(tarball) ? tarball : path.join(repositoryRoot, tarball);
}

async function startRegistryServer(
  tokensTarball: string,
): Promise<{ close: () => void; origin: string }> {
  const publicRoot = path.join(repositoryRoot, "apps/docs/public/r");
  const script = `
    import { createServer } from "node:http";
    import { readFile } from "node:fs/promises";
    import path from "node:path";
    const root = process.argv[1];
    const tokensTarball = process.argv[2];
    const server = createServer(async (request, response) => {
      try {
        const relative = decodeURIComponent(new URL(request.url, "http://localhost").pathname).replace(/^\\/+/, "");
        const target = path.resolve(root, relative);
        if (!target.startsWith(path.resolve(root) + path.sep)) throw new Error("Invalid registry path");
        const origin = "http://127.0.0.1:" + server.address().port + "/";
        const content = (await readFile(target, "utf8"))
          .replaceAll("https://ui.lenso.dev/r/", origin)
          .replaceAll("@lenso/tokens@0.1.0", "file:" + tokensTarball);
        response.writeHead(200, { "content-type": "application/json" });
        response.end(content);
      } catch {
        response.writeHead(404);
        response.end("Not found");
      }
    });
    server.listen(0, "127.0.0.1", () => process.stdout.write(String(server.address().port) + "\\n"));
  `;
  const child = spawn(
    process.execPath,
    ["--input-type=module", "--eval", script, publicRoot, tokensTarball],
    { stdio: ["ignore", "pipe", "inherit"] },
  );
  const port = await new Promise<string>((resolve, reject) => {
    child.once("error", reject);
    child.stdout.once("data", (chunk) => resolve(String(chunk).trim()));
    child.once("exit", (code) => reject(new Error(`Registry server exited early: ${code}`)));
  });
  return {
    close: () => child.kill(),
    origin: `http://127.0.0.1:${port}`,
  };
}

async function verifyNextPackageConsumer(tempRoot: string) {
  const tarballRoot = path.join(tempRoot, "tarballs");
  await mkdir(tarballRoot, { recursive: true });
  const [tokens, ui, primitives] = await Promise.all([
    pack("@lenso/tokens", tarballRoot),
    pack("@lenso/ui", tarballRoot),
    pack("@lenso/primitives", tarballRoot),
  ]);
  const projectRoot = path.join(tempRoot, "next-package");
  await mkdir(projectRoot, { recursive: true });
  await writeProjectFile(
    projectRoot,
    "package.json",
    `${JSON.stringify(
      {
        private: true,
        scripts: { build: "next build", start: "next start" },
        dependencies: {
          "@base-ui/react": "1.7.0",
          "@lenso/primitives": `file:${primitives}`,
          "@lenso/tokens": `file:${tokens}`,
          "@lenso/ui": `file:${ui}`,
          "lucide-react": "1.31.0",
          next: "16.3.1",
          react: "19.2.8",
          "react-dom": "19.2.8",
        },
        devDependencies: {
          "@types/node": "26.2.0",
          "@types/react": "19.2.18",
          "@types/react-dom": "19.2.4",
          typescript: "7.0.2",
        },
      },
      null,
      2,
    )}\n`,
  );
  await writeProjectFile(
    projectRoot,
    "pnpm-workspace.yaml",
    `packages:\n  - "."\noverrides:\n  "@lenso/tokens": "file:${tokens}"\n`,
  );
  await writeProjectFile(
    projectRoot,
    "app/layout.tsx",
    `import type { ReactNode } from "react";\nimport "@lenso/tokens/styles.css";\nimport "@lenso/ui/styles.css";\nexport default function Layout({ children }: { children: ReactNode }) { return <html><body>{children}</body></html>; }\n`,
  );
  await writeProjectFile(
    projectRoot,
    "app/page.tsx",
    `"use client";\nimport { Sidebar } from "@lenso/primitives/sidebar";\nimport { Button } from "@lenso/ui/button";\nimport { CSPProvider } from "@lenso/ui/csp-provider";\nimport { Dialog } from "@lenso/ui/dialog";\nimport { TextField } from "@lenso/ui/text-field";\nimport { ThemeScope } from "@lenso/ui/theme-scope";\nexport default function Page() { return <CSPProvider nonce="smoke" disableStyleElements><ThemeScope theme="dark"><Button>Installed</Button><TextField.Root><TextField.Label>Name</TextField.Label><TextField.Control /></TextField.Root><Dialog.Root><Dialog.Trigger>Open</Dialog.Trigger><Dialog.Portal><Dialog.Backdrop /><Dialog.Viewport><Dialog.Popup><Dialog.Title>Installed dialog</Dialog.Title><Dialog.Close>Close</Dialog.Close></Dialog.Popup></Dialog.Viewport></Dialog.Portal></Dialog.Root><Sidebar.Root defaultOpen><Sidebar.Trigger>Toggle</Sidebar.Trigger><Sidebar.Panel>Navigation</Sidebar.Panel></Sidebar.Root></ThemeScope></CSPProvider>; }\n`,
  );
  runPnpm(["install"], projectRoot);
  runPnpm(["build"], projectRoot);
  await verifyInChromium(
    projectRoot,
    [path.join(projectRoot, "node_modules/next/dist/bin/next"), "start", "-p"],
    async (page) => {
      await page.getByRole("button", { name: "Installed" }).waitFor();
      const labelColor = await page
        .getByText("Name", { exact: true })
        .evaluate((node) => getComputedStyle(node).color);
      if (labelColor !== "rgb(247, 248, 248)") throw new Error(`Dark token failed: ${labelColor}`);
      await page.getByRole("button", { name: "Open" }).click();
      await page.getByRole("dialog", { name: "Installed dialog" }).waitFor();
      await page.keyboard.press("Escape");
      await page.getByRole("dialog", { name: "Installed dialog" }).waitFor({ state: "hidden" });
      await page.getByText("Navigation").waitFor();
      await page.getByRole("button", { name: "Toggle" }).click();
      await page.getByText("Navigation").waitFor({ state: "hidden" });
      await page.getByRole("button", { name: "Toggle" }).click();
      await page.getByText("Navigation").waitFor();
    },
  );
}

async function verifyViteRegistryConsumer(tempRoot: string) {
  const projectRoot = path.join(tempRoot, "vite-registry");
  const tarballRoot = path.join(tempRoot, "registry-tarballs");
  await mkdir(tarballRoot, { recursive: true });
  const tokensTarball = await pack("@lenso/tokens", tarballRoot);
  await writeProjectFile(
    projectRoot,
    "package.json",
    `${JSON.stringify(
      {
        private: true,
        scripts: { build: "vite build", preview: "vite preview" },
        dependencies: {
          "@lenso/tokens": `file:${tokensTarball}`,
          react: "19.2.8",
          "react-dom": "19.2.8",
        },
        devDependencies: {
          shadcn: "4.18.0",
          "@stylexjs/unplugin": "0.19.0",
          "@types/react": "19.2.18",
          "@types/react-dom": "19.2.4",
          vite: "8.2.1",
        },
      },
      null,
      2,
    )}\n`,
  );
  await writeProjectFile(
    projectRoot,
    "pnpm-workspace.yaml",
    `packages:\n  - "."\noverrides:\n  "@lenso/tokens": "file:${tokensTarball}"\n  "@lenso/tokens@0.1.0": "file:${tokensTarball}"\n`,
  );
  await writeProjectFile(
    projectRoot,
    "components.json",
    `${JSON.stringify(
      {
        $schema: "https://ui.shadcn.com/schema.json",
        aliases: {
          components: "@/components",
          hooks: "@/hooks",
          lib: "@/lib",
          ui: "@/components/ui",
          utils: "@/lib/utils",
        },
        iconLibrary: "lucide",
        rsc: false,
        style: "new-york",
        tailwind: { baseColor: "neutral", config: "", css: "src/index.css", cssVariables: true },
        tsx: true,
      },
      null,
      2,
    )}\n`,
  );
  await writeProjectFile(
    projectRoot,
    "tsconfig.json",
    `${JSON.stringify(
      {
        compilerOptions: {
          baseUrl: ".",
          jsx: "react-jsx",
          module: "ESNext",
          moduleResolution: "Bundler",
          paths: { "@/*": ["./*"] },
          strict: true,
          target: "ES2022",
        },
        include: ["src", "components"],
      },
      null,
      2,
    )}\n`,
  );
  await writeProjectFile(projectRoot, "src/index.css", "");
  await writeProjectFile(
    projectRoot,
    "index.html",
    '<div id="root"></div><script type="module" src="/src/main.tsx"></script>\n',
  );
  await writeProjectFile(
    projectRoot,
    "vite.config.mjs",
    `import stylex from "@stylexjs/unplugin/vite";\nexport default { plugins: [stylex({ devMode: "off", useCSSLayers: true })] };\n`,
  );
  await writeProjectFile(
    projectRoot,
    "src/main.tsx",
    `import React from "react";\nimport { createRoot } from "react-dom/client";\nimport "@lenso/tokens/styles.css";\nimport { Button } from "../components/lenso/button/index.js";\nimport { CSPProvider } from "../components/lenso/csp-provider/index.js";\nimport { Dialog } from "../components/lenso/dialog/index.js";\nimport { TextField } from "../components/lenso/text-field/index.js";\nimport { ThemeScope } from "../components/lenso/theme-scope/index.js";\nimport { SidebarRecipe } from "../components/lenso/sidebar/sidebar.js";\nfunction App() { return <CSPProvider nonce="smoke"><ThemeScope theme="dark"><Button>Registry</Button><TextField.Root><TextField.Label>Name</TextField.Label><TextField.Control /></TextField.Root><Dialog.Root><Dialog.Trigger>Open</Dialog.Trigger><Dialog.Portal><Dialog.Backdrop /><Dialog.Viewport><Dialog.Popup><Dialog.Title>Registry dialog</Dialog.Title><Dialog.Close>Close</Dialog.Close></Dialog.Popup></Dialog.Viewport></Dialog.Portal></Dialog.Root><SidebarRecipe.Root defaultOpen><SidebarRecipe.Trigger>Toggle</SidebarRecipe.Trigger><SidebarRecipe.Panel><SidebarRecipe.Item selected>Home</SidebarRecipe.Item></SidebarRecipe.Panel></SidebarRecipe.Root></ThemeScope></CSPProvider>; }\ncreateRoot(document.getElementById("root")!).render(<App />);\n`,
  );
  runPnpm(["install"], projectRoot);
  const server = await startRegistryServer(tokensTarball);
  try {
    runPnpm(
      [
        "exec",
        "shadcn",
        "add",
        `${server.origin}/button.json`,
        `${server.origin}/csp-provider.json`,
        `${server.origin}/dialog.json`,
        `${server.origin}/text-field.json`,
        `${server.origin}/sidebar.json`,
        "--yes",
        "--overwrite",
      ],
      projectRoot,
    );
  } finally {
    server.close();
  }
  runPnpm(["build"], projectRoot);
  await verifyInChromium(
    projectRoot,
    [path.join(projectRoot, "node_modules/vite/bin/vite.js"), "preview", "--port"],
    async (page) => {
      await page.getByRole("button", { name: "Registry" }).waitFor();
      const labelColor = await page
        .getByText("Name", { exact: true })
        .evaluate((node) => getComputedStyle(node).color);
      if (labelColor !== "rgb(247, 248, 248)") throw new Error(`Dark token failed: ${labelColor}`);
      await page.getByRole("button", { name: "Open" }).click();
      await page.getByRole("dialog", { name: "Registry dialog" }).waitFor();
      await page.keyboard.press("Escape");
      await page.getByRole("dialog", { name: "Registry dialog" }).waitFor({ state: "hidden" });
      await page.getByRole("button", { name: "Home" }).waitFor();
      await page.getByRole("button", { name: "Toggle" }).click();
      await page.getByRole("button", { name: "Home" }).waitFor({ state: "hidden" });
      await page.getByRole("button", { name: "Toggle" }).click();
      await page.getByRole("button", { name: "Home" }).waitFor();
    },
  );
}

const tempRoot = await mkdtemp(path.join(os.tmpdir(), "lenso-ui-smoke-"));
await verifyNextPackageConsumer(tempRoot);
await verifyViteRegistryConsumer(tempRoot);
process.stdout.write(`Release smoke passed in ${tempRoot}\n`);
