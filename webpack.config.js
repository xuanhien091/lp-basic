const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const FileIncludeWebpackPlugin = require('file-include-webpack-plugin')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const outputDir = path.resolve(__dirname, 'dist/');

module.exports = {
    mode: process.env.NODE_ENV || 'development',
    devtool: 'inline-source-map',
    entry: [path.resolve(__dirname, '_src/resource/js/main.js'), path.resolve(__dirname, '_src/resource/sass/styles.scss')],
    output: {
        path: outputDir,
        filename: 'js/[name].js'
    },
    plugins: [
        new BrowserSyncPlugin({
            host: 'localhost',
            port: 8080,
            server: { baseDir: ['./dist'] }
          }),
        new CopyPlugin({
            patterns: [
                { from: path.resolve(__dirname, '_src/app'), to: path.resolve(__dirname, 'dist/src') },
                { from: path.resolve(__dirname, '_modules/pages/assets'), to: path.resolve(__dirname, 'dist/assets') },
            ],
        }),
        new FileIncludeWebpackPlugin(
            {
                source: './_modules/pages', // relative path to your templates
                replace: [{
                    regex: /\[\[FILE_VERSION]]/, // additional things to replace
                    to: 'v=1.0.0',
                }],
                destination: './',
            },
        ),
    ],

    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: ['babel-loader']
        }],
        rules: [{
            test: /\.scss$/,
            use: [
                {
                    loader: 'file-loader',
                    options: {
                        name: 'css/[name].css'
                    }
                },
                {
                    loader: 'extract-loader'
                },
                {
                    loader: 'css-loader?-url'
                },
                {
                    loader: 'postcss-loader'
                },
                {
                    loader: 'sass-loader'
                }

            ]
        }]
    }
};