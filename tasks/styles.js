import gulp from 'gulp'
import { paths } from '../gulpfile'
import sass from 'gulp-sass'
import moduleImporter from 'sass-module-importer'
import postcss from 'gulp-postcss'
import postcssPresetEnv from 'postcss-preset-env'
import colorModFunction  from 'postcss-color-mod-function'
import notify from 'gulp-notify'


export function styles() {
  return gulp.src(paths.styles, { allowEmpty: true, sourcemaps: true })
    .pipe(
      sass({
        // compile to expanded css because
        // this is a browser extension
        outputStyle: 'expanded',
        // import scss from node_modules
        importer: moduleImporter(),
        includePaths: 'node_modules/',
      })
    )
    .on('error', notify.onError({
      title: 'Error compiling sass!',
    }))
    .pipe(
      postcss([
        // autoprefixer for the browserslist in package.json
        // and other futuristic css features
        postcssPresetEnv({ stage: 0 }),
        // TODO remove this when this issue will be resolved
        // https://github.com/csstools/postcss-preset-env/issues/108
        colorModFunction(),
      ])
    )
    .on('error', notify.onError({
      title: 'Error compiling postcss!',
    }))
    .pipe(gulp.dest('build', { sourcemaps: '.' }))
}
