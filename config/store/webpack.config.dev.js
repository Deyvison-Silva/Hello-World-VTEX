const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const autoprefixer = require("autoprefixer");
const merge = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const LiveReloadPlugin = require("webpack-livereload-plugin");
const md5File = require("md5-file");
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const common = require("./webpack.common.js");

const ROOT_DIR = path.resolve(__dirname, "../..");
const DIST_DIR = path.resolve(ROOT_DIR, "dist");

const NAME_PROJECT = path
    .resolve(__dirname, ROOT_DIR)
    .split(path.sep)
    .pop();

LiveReloadPlugin.prototype.done = function done(stats) {
    this.fileHashes = this.fileHashes || {};

    const fileHashes = {};
    for (let file of Object.keys(stats.compilation.assets)) {
        fileHashes[file] = md5File.sync(stats.compilation.assets[file].existsAt);
    }

    const toInclude = Object.keys(fileHashes).filter(file => {
        if (this.ignore && file.match(this.ignore)) {
            return false;
        }
        return !(file in this.fileHashes) || this.fileHashes[file] !== fileHashes[file];
    });

    if (this.isRunning && toInclude.length) {
        this.fileHashes = fileHashes;
        console.log("Live Reload: Reloading " + toInclude.join(", "));
        setTimeout(
            function onTimeout() {
                this.server.notifyClients(toInclude);
            }.bind(this)
        );
    }
};

const liveReload = new LiveReloadPlugin({
    key: fs.readFileSync(path.resolve(__dirname, "../files/server.key")),
    cert: fs.readFileSync(path.resolve(__dirname, "../files/server.crt")),
    hostname: "localhost",
    protocol: "https",
    port: 3001,
    appendScriptTag: true
});

const config = {
    mode: "development", //
    devtool: "eval",
    output: {
        path: DIST_DIR,
        publicPath: "/dist/",
        filename: `${NAME_PROJECT}.min.js`
    },
    module: {
        rules: [
            // css
            {
                test: /\.css$/,
                include: /node_modules/,
                loader: ["style-loader", "css-loader"]
            },
            // sass
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    "css-hot-loader",
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: true
                        }
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: [autoprefixer("last 4 version")],
                            sourceMap: true,
                            includePaths: [
                                path.resolve(__dirname, "../../node_modules/compass-mixins/lib")
                            ]
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: true,
                            includePaths: [
                                path.resolve(__dirname, "../../node_modules/compass-mixins/lib")
                            ]
                        }
                    },
                    // resources loader
                    {
                        loader: "sass-resources-loader",
                        options: {
                            resources: require(path.resolve(__dirname, "../files/utils"))
                        }
                    }
                ]
            }
        ]
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                default: false,
                vendors: false,
                vendor: {
                    test: /[\\/](node_modules|assets)[\\/]/,
                    name: "vendor",
                    filename: `${NAME_PROJECT}-vendor.min.js`,
                    chunks: "all"
                }
            }
        }
    },
    externals: {
        $: "jQuery",
        jquery: "jQuery",
        "window.jquery": "jQuery"
    },
    plugins: [
        new ProgressBarPlugin({
            format: "Build [:bar] :percent (:elapsed seconds)",
            clear: false
        }),
        new MiniCssExtractPlugin({
            filename: `${NAME_PROJECT}.css`,
            chunkFilename: `${NAME_PROJECT}-vendor.css`
        }),
        liveReload
    ]
};

module.exports = merge(common, config);
