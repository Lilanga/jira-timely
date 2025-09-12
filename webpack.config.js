const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: './src/index.js',
  devtool: isProduction ? false : 'eval-cheap-module-source-map', // Faster dev builds
  
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: isProduction 
      ? 'static/js/[name].[contenthash:8].js'
      : 'static/js/[name].js', // No hash in dev for faster builds
    chunkFilename: isProduction
      ? 'static/js/[name].[contenthash:8].chunk.js'
      : 'static/js/[name].chunk.js',
    publicPath: './',
    clean: true,
    globalObject: 'globalThis'
  },

  target: 'web',

  // Enable persistent caching for faster rebuilds
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, 'node_modules/.cache/webpack'),
  },

  // Optimize build performance
  experiments: {
    cacheUnaffected: true,
  },

  // Development server (if needed)
  devServer: isDevelopment ? {
    static: path.join(__dirname, 'build'),
    port: 3000,
    hot: true,
    open: false
  } : undefined,

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    fallback: {
      events: require.resolve('events/'),
      crypto: false,
      path: false,
      fs: false,
      os: false,
      stream: false,
      buffer: false
    },
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },

  module: {
    rules: [
      // JavaScript/JSX
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: { electron: '32' },
                useBuiltIns: 'entry',
                corejs: 3
              }],
              ['@babel/preset-react', {
                runtime: 'automatic'
              }]
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-transform-runtime'
            ]
          }
        }
      },
      
      // CSS/SCSS
      {
        test: /\.s?css$/,
        use: [
          isProduction 
            ? MiniCssExtractPlugin.loader 
            : 'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  ['autoprefixer'],
                ]
              }
            }
          },
          'sass-loader'
        ]
      },

      // Images
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[name].[hash:8][ext]'
        }
      },

      // Fonts
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[name].[hash:8][ext]'
        }
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      templateParameters: {
        PUBLIC_URL: '.'
      },
      minify: isProduction ? {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      } : false
    }),

    ...(isProduction ? [
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].chunk.css'
      })
    ] : []),

    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          to: '',
          globOptions: {
            ignore: ['**/index.html']
          }
        }
      ]
    }),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.REACT_APP_JIRA_CLIENT_ID': JSON.stringify(process.env.REACT_APP_JIRA_CLIENT_ID || ''),
      'process.env.REACT_APP_OAUTH_CONFIDENTIAL': JSON.stringify(process.env.REACT_APP_OAUTH_CONFIDENTIAL || 'true'),
      'process.env.REACT_APP_JIRA_CLIENT_SECRET': JSON.stringify(process.env.REACT_APP_JIRA_CLIENT_SECRET || '')
    })
  ],

  optimization: {
    minimize: isProduction,
    minimizer: isProduction ? [
      new TerserPlugin({
        parallel: true, // Use multiple processes for faster builds
        terserOptions: {
          parse: { ecma: 8 },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
            drop_console: true,
            drop_debugger: true
          },
          mangle: { safari10: true },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true
          }
        }
      })
    ] : [],
    
    splitChunks: isProduction ? {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        }
      }
    } : false, // Disable code splitting in development for faster builds

    runtimeChunk: isProduction ? {
      name: 'runtime'
    } : false
  },

  performance: {
    hints: isProduction ? 'warning' : false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },

  ignoreWarnings: [
    /Failed to parse source map/,
    /source-map-loader/
  ]
};