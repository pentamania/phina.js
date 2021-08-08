import license from 'rollup-plugin-license';
import replace from '@rollup/plugin-replace'
import pkg from './package.json';

const banner = `/*!
 * ${ pkg.name } v${pkg.version}
 * Released under the ${pkg.license} license
 *
 * Copyright (C) ${pkg.author}
 */`;

export default [
  // esm ver.
  {
    input: 'src/index.esm.js',
    output: {
      file: 'build/phina.esm.js',
      format: 'esm',
    },
    plugins: [
      replace({
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