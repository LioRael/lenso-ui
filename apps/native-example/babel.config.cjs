module.exports = function (api) {
  const platform = api.caller((caller) => caller && caller.platform);
  return {
    presets: ["babel-preset-expo", ["react-strict-dom/babel-preset", { platform }]],
  };
};
