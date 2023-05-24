const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const pjson = require('./package.json');
const version = pjson.version;

module.exports = (_, argv) => {
  const mode = argv.mode || 'production';
  const filename = (mode === 'development') ? `visearch.js` : `visearch-${version}.min.js`;
  return {
    resolve: {
      extensions: ['.ts', '.js'],
    },
    entry: {
      main: path.join(__dirname, 'src/index.ts'),
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename,
      chunkFilename: '[chunkhash].js',
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-typescript",
            ]
          },
        },
      ],
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          extractComments: false
        })
      ]
    },
    mode,
    plugins: [
      new webpack.ProvidePlugin({
        Promise: 'imports-loader?this=>global!exports-loader?global.Promise!es6-promise',
        fetch: 'imports-loader?this=>global!exports-loader?global.fetch!node-fetch',
      }),
    ],
  }
};
