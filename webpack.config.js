const path = require('path');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const WebpackObfuscator = require('webpack-obfuscator');

module.exports = {
	mode: 'development',
	entry: {
		main: './src/index.ts',
		aiworker: './src/ai/worker.ts',
	},
	devtool: 'eval',
	// devtool: 'inline-source-map',
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: {
					loader: 'ts-loader',
					options: { configFile: 'tsconfig.json' }
				},
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: ['.ts'],
	},
	plugins: [
		new TerserWebpackPlugin({
			extractComments: true,
			terserOptions: {
				mangle: {
					properties: {
						regex: /(^P1|^p1|^_p1)[A-Z]\w*/
					}
				},
				sourceMap: false,
				keep_classnames: false,
				keep_fnames: false,
				toplevel: true,
			},
		}),
		// new WebpackObfuscator({
		// 	rotateStringArray: true,
		// })
	],
	optimization: {
		minimize: true,
	},
	output: {
		path: path.resolve(__dirname, 'docs'),
    filename: '[name].js',
	}
}