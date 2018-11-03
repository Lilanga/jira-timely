const { injectBabelPlugin } = require('react-app-rewired');

module.exports = function override(config, env) 
{
    config = injectBabelPlugin(['import', 
        { libraryName: 'antd', libraryDirectory: 'es', style: 'css' }], config,);
    config.target = 'electron-renderer';
    return config;
};