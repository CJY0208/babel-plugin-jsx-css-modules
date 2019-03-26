import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import { uglify } from 'rollup-plugin-uglify'

export default [
  {
    input: 'src/babel/index.js',
    output: {
      file: 'dist/babel/index.js',
      format: 'cjs'
    },
    plugins: [
      resolve(),
      babel({
        exclude: 'node_modules/**'
      })
    ]
  },
  {
    input: 'src/helpers/index.js',
    output: {
      name: 'JsxCssModulesHelper',
      file: 'dist/helpers/index.min.js',
      format: 'umd'
    },
    plugins: [
      resolve(),
      babel({
        exclude: 'node_modules/**'
      }),
      uglify()
    ]
  },
  {
    input: 'src/helpers/index.js',
    output: {
      name: 'JsxCssModulesHelper',
      file: 'dist/helpers/index.js',
      format: 'umd'
    },
    plugins: [
      resolve(),
      babel({
        exclude: 'node_modules/**'
      })
    ]
  }
]
