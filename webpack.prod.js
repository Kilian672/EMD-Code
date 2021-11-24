const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
	mode: 'production',
	plugins: [
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin({ patterns: [{ from: 'static' }] }),
	],
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'prod'),
	},
});
