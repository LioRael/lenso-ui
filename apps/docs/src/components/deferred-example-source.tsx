import { useEffect, useState } from "react";
import { ComponentSource } from "./component-source";
export type ExampleSourceFile = { name: string; code: string };
export function DeferredExampleSource({
  load,
  locale,
  initialFile,
}: {
  load: () => Promise<ExampleSourceFile[]>;
  locale: "en" | "cn";
  initialFile?: string;
}) {
  const [files, setFiles] = useState<ExampleSourceFile[]>();
  const [error, setError] = useState<unknown>();
  useEffect(() => {
    let current = true;
    load().then(
      (value) => {
        if (current) {
          const primary = initialFile && value.find((file) => file.name === initialFile);
          setFiles(primary ? [primary, ...value.filter((file) => file !== primary)] : value);
        }
      },
      (reason) => {
        if (current) setError(reason);
      },
    );
    return () => {
      current = false;
    };
  }, [load, initialFile]);
  if (error) throw error;
  if (!files) return <output>{locale === "cn" ? "正在加载源码…" : "Loading source…"}</output>;
  return (
    <ComponentSource
      code={files[0]?.code ?? ""}
      files={files}
      local
      standalone
      live
      active
      locale={locale}
    />
  );
}
