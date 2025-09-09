module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      webpackConfig.target = 'electron-renderer';
      
      // Ignore source map warnings from node_modules
      webpackConfig.ignoreWarnings = [
        /Failed to parse source map/,
        /source-map-loader/
      ];
      
      return webpackConfig;
    },
  },
};