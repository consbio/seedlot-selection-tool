import path from 'path'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import BundleTracker from 'webpack-bundle-tracker'

export default {
    context: __dirname,
    entry: [
        require.resolve('../seedsource-core/javascript/src/index'),
        './scss/sst.scss'
    ],
    plugins: [
        new BundleTracker({filename: '../webpack-stats.json'}),
        new MiniCssExtractPlugin({ filename: '[name].bundle.css' })
    ],
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: [path.resolve('./src'), path.resolve('../seedsource-core/javascript/src')],
                exclude: [/node_modules\/.*\/dist\/.*/],
                loader: 'babel-loader',
                query: {
                    presets: ['@babel/preset-env', '@babel/preset-react'],
                    plugins: ['@babel/plugin-syntax-dynamic-import', '@babel/plugin-proposal-class-properties']
                }
            },
            {
                test: /\.(scss|css)$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {}
                    },
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.(png|gif|jpe?g|svg|pdf)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[hash].[ext]'
                }
            },
            {
                test: /\.jison$/,
                loader: path.resolve('./loaders/jison-loader.js')
            }
        ]
    },
    resolve: {
        modules: [
            path.resolve('./node_modules'),
            path.resolve('../seedsource-core/javascript/node_modules'),
            path.resolve('./src'),
            path.resolve('../seedsource-core/javascript'),
            path.resolve('../seedsource-core/javascript/src'),
            path.resolve('../seedsource-core/javascript/scss'),
            path.resolve('./')
        ],
        alias: {
            core: path.resolve('../seedsource-core/javascript/src')
        },
        extensions: ['.js', '.jsx']
    },
    node: {
        fs: 'empty'
    }
}
