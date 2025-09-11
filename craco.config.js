module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Build the renderer bundle for the web (Node disabled in renderer)
      webpackConfig.target = 'web';
      // Ensure a safe global object in renderer without relying on Node's `global`
      webpackConfig.output = webpackConfig.output || {};
      webpackConfig.output.globalObject = 'globalThis';
      
      // Ensure EventEmitter is available for webpack HMR in browser
      webpackConfig.resolve = webpackConfig.resolve || {};
      webpackConfig.resolve.fallback = Object.assign({}, webpackConfig.resolve.fallback, {
        events: require.resolve('events/')
      });

      // Ignore source map warnings from node_modules
      webpackConfig.ignoreWarnings = [
        /Failed to parse source map/,
        /source-map-loader/
      ];
      
      return webpackConfig;
    },
  },
};
