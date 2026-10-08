import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

// Append after output-producing plugins and use watch with clean: false. Keep
// the existing files when their final bytes match so consumer caches stay valid.
export default function preserveWatchOutput() {
  return {
    name: "lenso-preserve-watch-output",
    generateBundle: {
      order: "post",
      async handler(options, bundle, isWrite) {
        if (!this.meta.watchMode || !isWrite) return;
        const directory = options.dir ?? (options.file && dirname(options.file));
        if (!directory) return;
        for (const [name, output] of Object.entries(bundle)) {
          const bytes = Buffer.from(output.type === "chunk" ? output.code : output.source);
          let previous;
          try {
            previous = await readFile(resolve(directory, output.fileName));
          } catch (error) {
            if (error.code === "ENOENT") continue;
            throw error;
          }
          if (bytes.equals(previous)) delete bundle[name];
        }
      },
    },
  };
}
