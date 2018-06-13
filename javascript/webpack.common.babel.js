import path from 'path'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import BundleTracker from 'webpack-bundle-tracker'

export default {
    context: __dirname,
    entry: [
        require.resolve('../seedsource-core/javascript/src/index'),
        './scss/sst.scss'
    ],
    plugins: [
        new BundleTracker({filename: '../webpack-stats.json'}),
        new ExtractTextPlugin({filename: '[name].bundle.css'})
    ],
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: [path.resolve('./src'), path.resolve('../seedsource-core/javascript/src')],
                loader: 'babel-loader',
                query: {presets: [require.resolve('babel-preset-env'), require.resolve('babel-preset-react')]}
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'sass-loader']
                })
            },
            {
                test: /\.(png|pdf|gif|jpe?g|svg)$/,
                loader: 'file-loader'
            }
        ]
    },
    resolve: {
        modules: [
            path.resolve('./node_modules'), path.resolve('./src'), path.resolve('../seedsource-core/javascript/src'),
            path.resolve('../seedsource-core/javascript/scss'), path.resolve('./')
        ],
        extensions: ['.js', '.jsx']
    }
}