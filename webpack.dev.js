const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  devtool: 'eval-cheap-module-source-map',
  
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'static/js/[name].js',
    chunkFilename: 'static/js/[name].chunk.js',
    publicPath: './',
    clean: true,
    globalObject: 'globalThis'
  },

  target: 'web',

  // Fast development builds
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, 'node_modules/.cache/webpack-dev'),
  },

  // Development server
  devServer: {
    static: path.join(__dirname, 'build'),
    port: 3000,
    hot: true,
    open: false,
    historyApiFallback: true
  },

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
            cacheDirectory: true, // Enable caching for faster builds
            cacheCompression: false,
            presets: [
              ['@babel/preset-env', {
                targets: { electron: '32' },
                modules: false
              }],
              ['@babel/preset-react', {
                runtime: 'automatic',
                development: true
              }]
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties'
            ]
          }
        }
      },
      
      // CSS/SCSS - Fast development loading
      {
        test: /\.s?css$/,
        use: [
          'style-loader', // Always use style-loader in dev for HMR
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              importLoaders: 1
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
          filename: 'static/media/[name][ext]' // No hash in dev
        }
      },

      // Fonts
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[name][ext]' // No hash in dev
        }
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      inject: true,
      templateParameters: {
        PUBLIC_URL: '.'
      }
    }),

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
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env.REACT_APP_JIRA_CLIENT_ID': JSON.stringify(process.env.REACT_APP_JIRA_CLIENT_ID || ''),
      'process.env.REACT_APP_OAUTH_CONFIDENTIAL': JSON.stringify(process.env.REACT_APP_OAUTH_CONFIDENTIAL || 'true'),
      'process.env.REACT_APP_JIRA_CLIENT_SECRET': JSON.stringify(process.env.REACT_APP_JIRA_CLIENT_SECRET || '')
    }),

    new webpack.HotModuleReplacementPlugin()
  ],

  // No optimization for dev builds
  optimization: {
    minimize: false,
    splitChunks: false,
    runtimeChunk: false
  },

  performance: {
    hints: false // Disable performance hints in development
  }
};