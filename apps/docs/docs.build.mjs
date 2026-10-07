export default {
  allowedDevOrigins: ["127.0.0.1"],
  transpilePackages: ["@lenso/tokens", "@lenso/docs"],
  webpack(config) {
    // Only this precompiled Fumadocs helper must bypass Next's Babel CJS rewrite.
    for (const rule of config.module.rules) {
      if (rule && typeof rule === "object" && Array.isArray(rule.oneOf)) {
        rule.oneOf.unshift({
          test: /fumadocs-core[\\/]dist[\\/]remove-markdown-[^\\/]+\.js$/,
          type: "javascript/esm",
        });
      }
    }
    return config;
  },
};
