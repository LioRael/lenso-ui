const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
// React and RSD contexts/variable registries must be shared across the workspace.
config.resolver.resolveRequest = (context, name, platform) => {
  if (
    name === "react" ||
    name.startsWith("react/") ||
    name === "react-strict-dom" ||
    name.startsWith("react-strict-dom/")
  ) {
    return context.resolveRequest({ ...context, originModulePath: __filename }, name, platform);
  }
  return context.resolveRequest(context, name, platform);
};
module.exports = config;
