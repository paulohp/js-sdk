'use strict';

var webpack = require("webpack");

module.exports = {
    entry: "./src/timekit.js",
    devtool: "source-map",
    output: {
        path: "./dist",
        filename: "timekit.js",
        libraryTarget: "umd",
        library: "timekit"
    },
    plugins: [
        new webpack.IgnorePlugin(/vertx/)
    ]
};
