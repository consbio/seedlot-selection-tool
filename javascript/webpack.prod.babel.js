import webpack from 'webpack'
import path from 'path'
import merge from 'webpack-merge'
import common from './webpack.common.babel.js'

export default merge(common, {
    mode: 'production',
    devtool: 'source-map',
    plugins: [
        new webpack.HashedModuleIdsPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
    ],
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].[chunkhash].bundle.js',
        publicPath: '/static/'
    }
})
