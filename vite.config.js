import { defineConfig } from 'vite';
import dotenv from 'dotenv';
import { resolve } from 'path';
import glob from 'glob';
import handlebars from 'vite-plugin-handlebars';
import createExternal from 'vite-plugin-external';
import externalGlobals from 'rollup-plugin-external-globals';
import sassGlobImports from 'vite-plugin-sass-glob-import';
import { watchAndRun } from 'vite-plugin-watch-and-run';
import filterReplace from 'vite-plugin-filter-replace';
import { directoryPlugin } from 'vite-plugin-list-directory-contents';

const root = resolve(__dirname, 'src');
const outDir = resolve(__dirname, 'build');
const allHtmlFiles = glob.sync(resolve(root, './*.html').replace(/\\/g, '/'));
const htmlFilesToBuild = allHtmlFiles;

dotenv.config(); // load env vars from .env

export default defineConfig({
	base: '',
	root,
	server: {
		port: '3000',
	},
	build: {
		outDir,
		rollupOptions: {
			input: htmlFilesToBuild,
			output: {
				assetFileNames: (assetInfo) => {
					const extType = assetInfo.name.split('.').pop();
					const isCSS = extType == 'css';

					return isCSS ? `assets/style.[ext]` : `assets/[name].[ext]`; // Hacky solution to fix issues with build file names.
				},
				entryFileNames: () => {
					const areMoreThanOneHTMLs = htmlFilesToBuild.length > 1;

					return areMoreThanOneHTMLs ? `assets/[name].js` : 'assets/app.js'; // Hacky solution to fix issues with build file names.
				},
				chunkFileNames: 'assets/app.js',
			},
		},
		emptyOutDir: true,
		minify: false,
	},
	plugins: [
		directoryPlugin({
			baseDir: root,
		}),
		handlebars({
			VITE_DOMAIN: process.env.VITE_DOMAIN,
			partialDirectory: resolve(root, 'partials'),
		}),
		filterReplace([
			{
				filter: /select2\/dist\/.+\.js$/,
				replace: {
					from: 'exports',
					to: 'undefined',
				},
			},
			{
				filter: /selectric\/public\/.+\.js$/,
				replace: {
					from: 'exports',
					to: 'undefined',
				},
			},
			{
				filter: /malihu-custom-scrollbar-plugin\/.+\.js$/,
				replace: {
					from: 'exports',
					to: 'undefined',
				},
			},
		]),
		externalGlobals(
			{
				jquery: 'jQuery',
			},
			{
				include: ['*.js', '*.ts', '*.jsx', '*.tsx', '*.vue'],
			}
		),
		createExternal({
			externals: {
				jquery: 'jQuery',
			},
		}),
		sassGlobImports(),
		watchAndRun([
			{
				watch: '**/scss/**/*.scss',
				watchKind: 'add',
				run: 'touch ./src/scss/style.scss',
				quiet: true,
			},
		]),
	],
});
