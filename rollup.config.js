import Alias from '@rollup/plugin-alias';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import Replace from '@rollup/plugin-replace';
import Typescript from '@rollup/plugin-typescript';
import Autoprefixer from 'autoprefixer';
import NodeSass from 'node-sass';
import Postcss from 'postcss';
import Cleanup from 'rollup-plugin-cleanup';
import {terser as Terser} from 'rollup-plugin-terser';

import Package from './package.json';

async function compileCss() {
	const css = NodeSass.renderSync({
		file: 'src/sass/plugin.scss',
		outputStyle: 'compressed',
	}).css.toString();

	const result = await Postcss([Autoprefixer]).process(css, {
		from: undefined,
	});
	return result.css.replace(/'/g, "\\'").trim();
}

function getPlugins(css, shouldMinify) {
	const plugins = [
		// Use ES6 source files to avoid CommonJS transpiling
		Alias({
			entries: [
				{
					find: '@tweakpane/core',
					replacement: './node_modules/@tweakpane/core/dist/es6/index.js',
				},
			],
		}),
		Typescript(),
		nodeResolve(),
		Replace({
			__css__: css,
			preventAssignment: false,
		}),
	];
	if (shouldMinify) {
		plugins.push(Terser());
	}
	return [
		...plugins,
		// https://github.com/microsoft/tslib/issues/47
		Cleanup({
			comments: 'none',
		}),
	];
}

export default async () => {
	const production = process.env.BUILD === 'production';
	const postfix = production ? '.min' : '';

	const distName = 'tweakpane-plugin-profiler';
	const css = await compileCss();
	return {
		input: 'src/index.ts',
		external: ['tweakpane'],
		output: {
			file: `dist/${distName}${postfix}.js`,
			format: 'umd',
			globals: {
				tweakpane: 'Tweakpane',
			},
			name: 'TweakpaneProfilerBladePlugin',
		},
		plugins: getPlugins(css, production),

		// Suppress `Circular dependency` warning
		onwarn(warning, rollupWarn) {
			if (warning.code === 'CIRCULAR_DEPENDENCY') {
				return;
			}
			rollupWarn(warning);
		},
	};
};
