import { defineConfig } from "fumadocs-mdx/config";
import { remarkLensoDocument } from "./scripts/remark-lenso-document";
export default defineConfig({ mdxOptions: { remarkPlugins: [remarkLensoDocument] } });
