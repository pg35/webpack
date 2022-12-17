const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
//const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  mode: "production",
  //mode: "production",
  entry: "/src/index.js", // main js
  output: {
    path: path.resolve(__dirname, "dist"), // output folder
    publicPath: "/",
    asyncChunks: false
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      })
    ]
  },
  module: {
    rules: [
      {
        test: /\.?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"]
          }
        }
      }
      /*{
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader", // for styles
        ],
      },*/
    ]
  }
  /*plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html", // base html
    }),
  ],*/
};
