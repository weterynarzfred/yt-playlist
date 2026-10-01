const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/js/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'yt.js',
    assetModuleFilename: '[name][ext]',
    clean: true,
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, use: 'swc-loader' },
      { test: /\.scss$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'] },
      { test: /\.(jpe?g|png)$/, type: 'asset/resource' },
    ],
  },
  plugins: [new MiniCssExtractPlugin({ filename: 'style.css' })],
  devtool: 'source-map',
};
