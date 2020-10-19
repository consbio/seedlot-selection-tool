import path from 'path'
import merge from 'webpack-merge'
import common from './webpack.common.babel.js'

export default merge(common, {
  entry: ['webpack-dev-server/client?http://localhost:3000', 'webpack/hot/only-dev-server'],
  devServer: {
    contentBase: './',
    hot: false,
    host: '127.0.0.1',
    port: 3000,
    inline: true,
    publicPath: '/assets/bundles/',
    stats: ['minimal', 'color'],
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  output: {
    path: path.resolve(__dirname, 'webpack_bundles'),
    filename: '[name].bundle.js',
    publicPath: 'http://127.0.0.1:3000/assets/bundles/',
    crossOriginLoading: 'anonymous',
  },
})
