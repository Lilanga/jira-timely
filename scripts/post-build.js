#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const appConfig = require('../src/config/app-config');

console.log('🔧 Running post-build tasks...');

// Create sample configuration file for distribution
const sampleConfigPath = path.join(__dirname, '../build/app-config.sample.json');
const distConfigPath = path.join(__dirname, '../dist/app-config.sample.json');

try {
  // Create sample config in build directory
  appConfig.constructor.createSampleConfig(sampleConfigPath);
  
  // Ensure dist directory exists
  const distDir = path.dirname(distConfigPath);
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // Copy sample config to dist directory for packaging
  appConfig.constructor.createSampleConfig(distConfigPath);
  
  console.log('✅ Sample configuration files created');
  
} catch (error) {
  console.error('❌ Failed to create sample config files:', error.message);
}

// Create production info file
const prodInfoPath = path.join(__dirname, '../build/prod-info.json');
const prodInfo = {
  buildTime: new Date().toISOString(),
  version: process.env.npm_package_version || '1.0.0',
  nodeVersion: process.version,
  platform: process.platform,
  arch: process.arch,
  environment: 'production'
};

try {
  fs.writeFileSync(prodInfoPath, JSON.stringify(prodInfo, null, 2));
  console.log('✅ Production info file created');
} catch (error) {
  console.error('❌ Failed to create production info file:', error.message);
}

console.log('🎉 Post-build tasks completed!');