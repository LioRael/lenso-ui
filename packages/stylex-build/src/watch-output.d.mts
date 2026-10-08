type WatchOutput = { fileName: string } & (
  | { type: "chunk"; code: string }
  | { type: "asset"; source: string | Uint8Array }
);
/** Append after StyleX and use watch with clean: false. Production outputs are untouched. */
export default function preserveWatchOutput(): {
  name: string;
  generateBundle: {
    order: "post";
    handler(
      this: { meta: { watchMode: boolean } },
      options: { dir?: string | undefined; file?: string | undefined },
      bundle: Record<string, WatchOutput>,
      isWrite: boolean,
    ): Promise<void>;
  };
};
