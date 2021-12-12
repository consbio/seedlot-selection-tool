import path from 'path'
import webpack from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import BundleTracker from 'webpack-bundle-tracker'

const mode = process.env.NODE_ENV || 'development'
const production = mode === 'production'
const bundleTracker = new BundleTracker({ filename: '../webpack-stats.json' })

const languages = [
  {
    name: 'default',
  },
  {
    name: 'es-mx',
    file: path.resolve('./locales/es_MX/merged.po'),
  },
]

export default languages.map(language => {
  const ttag = {}

  if (language.name !== 'default') {
    ttag.resolve = { translations: language.file }
  }

  return {
    name: language.name,
    mode,
    context: __dirname,
    devtool: 'source-map',
    entry: {
      [language.name === 'default' ? 'main' : `main.${language.name}`]: [
        ...(production ? [] : ['webpack-dev-server/client?http://localhost:3000', 'webpack/hot/only-dev-server']),
        './src/index',
        './scss/sst.scss',
      ],
    },
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: '[name].[chunkhash].bundle.js',
      publicPath: production ? '/static/' : 'http://127.0.0.1:3000/assets/bundles/',
      crossOriginLoading: production ? false : 'anonymous',
    },
    ...(production || language.name !== 'default'
      ? {}
      : {
          devServer: {
            // contentBase: './',
            hot: false,
            host: '127.0.0.1',
            port: 3000,
            // inline: true,
            headers: { 'Access-Control-Allow-Origin': '*' },
            devMiddleware: {
              index: true,
              publicPath: 'http://127.0.0.1:3000/assets/bundles/',
            },
          },
        }),
    optimization: {
      minimize: production,
      splitChunks: { cacheGroups: { default: false } },
    },
    resolve: {
      modules: ['node_modules', './src'],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      mainFields: ['browser', 'module', 'main'],
      fallback: {
        buffer: require.resolve('buffer/'),
        stream: require.resolve('stream-browserify/'),
        fs: false,
        path: require.resolve('path-browserify/'),
        process: require.resolve('process/'),
      },
      alias: {
        'react': path.resolve('./node_modules/react'),
        'react-dom': path.resolve('./node_modules/react-dom'),
        'react-redux': path.resolve('./node_modules/react-redux'),
      },
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: [/node_modules\/.*\/dist\/.*/],
          use: [
            {
              loader: 'babel-loader',
              options: { plugins: [['babel-plugin-ttag', ttag]] },
            },
          ],
        },
        {
          test: /\.tsx?$/,
          exclude: [/node_modules\/.*\/dist\/.*/],
          use: [
            {
              loader: 'babel-loader',
              options: { plugins: [['babel-plugin-ttag', ttag]] },
            },
            { loader: 'ts-loader' },
          ],
        },
        {
          test: /\.(scss|css)$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        },
        {
          test: /\.(png|gif|jpe?g|svg|pdf)$/,
          type: 'asset/resource',
          generator: {
            filename: '[name].[hash][ext]',
          },
        },
        {
          test: /\.jison$/,
          loader: path.resolve('./loaders/jison-loader.js'),
        },
      ],
    },
    plugins: [
      new webpack.ids.HashedModuleIdsPlugin(),
      bundleTracker,
      new MiniCssExtractPlugin({ filename: '[name].[hash].bundle.css' }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: ['process'],
      }),
    ],
  }
})
