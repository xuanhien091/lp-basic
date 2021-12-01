var path = require("path");
const outputDir = path.resolve(__dirname, "dest/js");
module.exports = {
  mode: process.env.NODE_ENV || "development",
  devtool: "source-map",
  entry: {
    main: [path.resolve(__dirname, "js/main.js")],
  },
  output: {
    path: outputDir,
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
    ],
  },
  optimization: {
    minimize: false,
  },
};
