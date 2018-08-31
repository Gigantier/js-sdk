import buble from 'rollup-plugin-buble'
import uglify from 'rollup-plugin-uglify'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import filesize from 'rollup-plugin-filesize'

import pkg from './package.json'

const { NODE_ENV } = process.env

const config = {
  input: 'src/gigantier.js',
  watch: {
    include: 'src/**'
  },
  external: ['es6-promise', 'fetch-everywhere'],
  plugins: [
    resolve({
      browser: true,
      jsnext: true
    }),
    commonjs(),
    buble({
      exclude: 'package.json',
      objectAssign: 'Object.assign'
    })
  ],
  output: [
    {
      file: pkg['cjs:main'],
      exports: 'named',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: pkg.browser,
      exports: 'named',
      format: 'umd',
      name: 'gigantier',
      globals: {
        inflected: 'inflected'
      }
    },
    {
      file: 'dist/gigantier.js',
      exports: 'named',
      format: 'es',
      name: 'gigantier',
      globals: {
        inflected: 'inflected'
      }
    }
  ],
  moduleContext: {
    [require.resolve('whatwg-fetch')]: 'global'
  }
}

if (NODE_ENV === 'production') {
  config.plugins.push(uglify())
}

config.plugins.push(json(), filesize())

export default config