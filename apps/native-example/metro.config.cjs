const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
// Native renderer and all workspace components must use the app's React 19.3.0.
config.resolver.resolveRequest = (context, name, platform) => {
  if (name === "react" || name.startsWith("react/")) {
    return context.resolveRequest(context, require.resolve(name), platform);
  }
  return context.resolveRequest(context, name, platform);
};
module.exports = config;
