const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const autoprefixer = require("autoprefixer");
const merge = require("webpack-merge");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const common = require("./webpack.common.js");

const ROOT_DIR = path.resolve(__dirname, "../..");
const DIST_DIR = path.resolve(ROOT_DIR, "dist");

const NAME_PROJECT = path
    .resolve(__dirname, ROOT_DIR)
    .split(path.sep)
    .pop();

const config = {
    mode: "production",
    devtool: "none",
    output: {
        path: DIST_DIR,
        publicPath: "/",
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
        runtimeChunk: false,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    output: {
                        comments: false
                    }
                }
            }),
            new OptimizeCssAssetsPlugin({
                cssProcessor: require("cssnano"),
                cssProcessorPluginOptions: {
                    preset: ["default", { discardComments: { removeAll: true } }]
                },
                canPrint: true
            })
        ],
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
        // clean dist folder
        new CleanWebpackPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new MiniCssExtractPlugin({
            filename: `${NAME_PROJECT}.css`,
            chunkFilename: `${NAME_PROJECT}-vendor.css`
        })
    ]
};

module.exports = merge(common, config);
