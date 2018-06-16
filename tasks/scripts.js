import gulp from 'gulp'
import { paths } from '../gulpfile'
import path from 'path'
import webpackStream from 'webpack-stream'
import webpack from 'webpack'
import Dotenv from 'dotenv-webpack'
import addSrc from 'gulp-add-src'
import gulpif from 'gulp-if'
import named from 'vinyl-named'
import notify from 'gulp-notify'


const webpackConfig = {
  mode: global.IS_PRODUCTION ? 'production' : 'development',
  output: {
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
    new Dotenv(),
  ],
  resolve: {
    modules: ['node_modules', 'src'],
    // Hack because of the worst package I ever used, wdt-emoji-bundle
    alias: {
      'emoji-js$': path.resolve(path.dirname('.'), 'node_modules/wdt-emoji-bundle/emoji.js')
    },
  },
}

export function scripts() {
  return gulp.src(paths.scripts, { allowEmpty: true })
    .pipe(gulpif(!global.IS_PRODUCTION, addSrc('utils/autoreload.js')))
    .pipe(named())
    .pipe(webpackStream(webpackConfig, webpack))
    .on('error', notify.onError({
      title: 'Error compiling scripts!',
    }))
    .pipe(gulp.dest('build'))
}
