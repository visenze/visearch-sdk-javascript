const path = require('path');
const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');
const S3Plugin = require('webpack-s3-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const pjson = require('./package.json');
const version = pjson.version;

const s3plugin = new S3Plugin({
  // Only upload js
  include: /.*\.(js)/,
  s3Options: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, //process.env.AWS_ACCESS_KEY_ID
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, //process.env.AWS_SECRET_ACCESS_KEY
    region: 'ap-southeast-1',
  },
  s3UploadOptions: {
    Bucket: 'visenze-static',
  },
  basePathTransform: function () {
    return new Promise(function (resolve, _) {
      resolve('visearch/dist/js');
    });
  },
});

module.exports = (_, argv) => {
  const mode = argv.mode || 'production';
  const filename = mode === 'development' ? `visearch.js` : `visearch-${version}.min.js`;
  const configs = {
    resolve: {
      extensions: ['.ts', '.js'],
      extensionAlias: {
        '.js': ['.js', '.ts'],
      },
    },
    entry: {
      main: path.join(__dirname, './index.ts'),
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
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-typescript'],
          },
        },
      ],
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          extractComments: false,
        }),
      ],
    },
    mode,
    plugins: [new CompressionPlugin()],
  };

  if (mode === 'production') {
    configs.plugins.push(s3plugin);
  }

  return configs;
};
