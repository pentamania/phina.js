import license from 'rollup-plugin-license';
import replace from '@rollup/plugin-replace'
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import typescript from 'rollup-plugin-typescript2'
// package.jsonのインポート(node.js v16想定)
// https://rollupjs.org/command-line-interface/#importing-package-json
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const banner = `/*!
 * ${ pkg.name } v${pkg.version}
 * Released under the ${pkg.license} license
 *
 * Copyright (C) ${pkg.author}
 */`;

// 型定義の出力は無し
/** @type {import("rollup-plugin-typescript2").RPT2Options} */
const noTSDeclaration = {
  tsconfigOverride: {
    compilerOptions: { 
      emitDeclarationOnly: false,
      declaration: false
    }
  }
};

export default [
  // esm
  {
    input: 'src/index.esm.ts',
    output: {
      file: 'build/phina.esm.js',
      format: 'esm',
    },
    external: [/@babel\/runtime/],
    plugins: [
      typescript(noTSDeclaration),
      babel({
        plugins: ['@babel/plugin-transform-runtime'],
        babelHelpers: 'runtime',
      }),
      replace({
        preventAssignment: true,
        delimiters: ['\"<%= ', ' %>\"'],
        values: {
          'version': JSON.stringify(pkg.version),
        },
      }),
      license({
        banner: banner,
      }),
    ],
  },

  // esm for browser
  {
    input: 'src/index.esm.ts',
    output: {
      file: 'build/phina.esm.mjs',
      format: 'esm',
    },
    plugins: [
      typescript(noTSDeclaration),
      babel({
        exclude: 'node_modules/**',
        babelHelpers: 'bundled',
      }),
      replace({
        preventAssignment: true,
        delimiters: ['\"<%= ', ' %>\"'],
        values: {
          'version': JSON.stringify(pkg.version),
        },
      }),
      license({
        banner: banner,
      }),
      terser()
    ],
  },

  // // umd ver.
  // {
  //   input: 'src/index.umd.js',
  //   output: {
  //     file: 'build/phina.js',
  //     format: 'umd',
  //     name: 'phina',
  //   },
  //   plugins: [
  //     license({
  //       banner: banner,
  //     }),
  //   ],
  // },

  // umd min ver.
  // TODO
]