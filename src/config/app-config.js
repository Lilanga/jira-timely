/**
 * Application Configuration Management
 * 
 * This module handles configuration for both development and production environments.
 * In production, configs are injected at build time and can be overridden by external config files.
 */

const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class AppConfig {
  constructor() {
    this.config = null;
    this.configPath = null;
    this.initialize();
  }

  initialize() {
    // Default configuration from environment variables
    const defaultConfig = {
      jira: {
        clientId: process.env.REACT_APP_JIRA_CLIENT_ID || '',
        clientSecret: process.env.REACT_APP_JIRA_CLIENT_SECRET || '',
        oauthConfidential: process.env.REACT_APP_OAUTH_CONFIDENTIAL === 'true'
      },
      oauth: {
        callbackPort: 8080,
        redirectUri: 'http://localhost:8080/callback'
      },
      app: {
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }
    };

    // In production, try to load external config
    if (app && app.isPackaged) {
      this.loadProductionConfig(defaultConfig);
    } else {
      this.config = defaultConfig;
    }
  }

  loadProductionConfig(defaultConfig) {
    try {
      // Try to load config from various locations
      const possiblePaths = [
        path.join(app.getPath('userData'), 'app-config.json'),
        path.join(path.dirname(app.getPath('exe')), 'app-config.json'),
        path.join(process.cwd(), 'app-config.json')
      ];

      let externalConfig = {};
      
      for (const configPath of possiblePaths) {
        if (fs.existsSync(configPath)) {
          try {
            const configData = fs.readFileSync(configPath, 'utf8');
            externalConfig = JSON.parse(configData);
            this.configPath = configPath;
            console.log(`✅ Loaded external config from: ${configPath}`);
            break;
          } catch (error) {
            console.warn(`⚠️  Failed to parse config at ${configPath}:`, error.message);
          }
        }
      }

      // Merge external config with defaults
      this.config = this.deepMerge(defaultConfig, externalConfig);
    } catch (error) {
      console.warn('⚠️  Failed to load external config, using defaults:', error.message);
      this.config = defaultConfig;
    }
  }

  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  get(path) {
    return this.getNestedValue(this.config, path);
  }

  set(path, value) {
    this.setNestedValue(this.config, path, value);
    this.saveConfig();
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  saveConfig() {
    if (!this.configPath || !app || !app.isPackaged) {
      return; // Don't save in development
    }

    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      console.log('✅ Configuration saved successfully');
    } catch (error) {
      console.error('❌ Failed to save configuration:', error.message);
    }
  }

  // Create a sample config file for distribution
  static createSampleConfig(outputPath) {
    const sampleConfig = {
      jira: {
        clientId: "YOUR_JIRA_CLIENT_ID",
        clientSecret: "YOUR_JIRA_CLIENT_SECRET", 
        oauthConfidential: true
      },
      oauth: {
        callbackPort: 8080,
        redirectUri: "http://localhost:8080/callback"
      },
      app: {
        environment: "production"
      }
    };

    try {
      fs.writeFileSync(outputPath, JSON.stringify(sampleConfig, null, 2));
      console.log(`✅ Sample config created at: ${outputPath}`);
    } catch (error) {
      console.error(`❌ Failed to create sample config: ${error.message}`);
    }
  }

  // Get all configuration for renderer process (without secrets)
  getPublicConfig() {
    return {
      jira: {
        clientId: this.get('jira.clientId'),
        oauthConfidential: this.get('jira.oauthConfidential')
      },
      oauth: {
        callbackPort: this.get('oauth.callbackPort'),
        redirectUri: this.get('oauth.redirectUri')
      },
      app: {
        version: this.get('app.version'),
        environment: this.get('app.environment')
      }
    };
  }
}

// Export singleton instance
const appConfig = new AppConfig();
module.exports = appConfig;