import path from 'path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import BundleTracker from 'webpack-bundle-tracker'

export default {
  context: __dirname,
  entry: [path.resolve('./src/index'), path.resolve('./scss/sst.scss')],
  plugins: [
    new BundleTracker({ filename: '../webpack-stats.json' }),
    new MiniCssExtractPlugin({ filename: '[name].bundle.css' }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: [/node_modules\/.*\/dist\/.*/],
        loader: 'babel-loader',
      },
      {
        test: /\.tsx?$/,
        exclude: [/node_modules\/.*\/dist\/.*/],
        loader: 'ts-loader',
        // query: {
        //     presets: ['@babel/preset-env', '@babel/preset-react'],
        //     plugins: ['@babel/plugin-syntax-dynamic-import', '@babel/plugin-proposal-class-properties']
        // }
      },
      {
        test: /\.(scss|css)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {},
          },
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(png|gif|jpe?g|svg|pdf)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[hash].[ext]',
        },
      },
      {
        test: /\.jison$/,
        loader: path.resolve('./loaders/jison-loader.js'),
      },
    ],
  },
  resolve: {
    modules: ['node_modules', './src'],
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      'react': path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
      'react-redux': path.resolve('./node_modules/react-redux')
    },
  },
  node: {
    fs: 'empty',
  },
}
