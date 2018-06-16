import gulp from 'gulp'
import { paths } from '../gulpfile'
import gulpif from 'gulp-if'
import sourcemaps from 'gulp-sourcemaps'
import sass from 'gulp-sass'
import moduleImporter from 'sass-module-importer'
import notify from 'gulp-notify'


export function styles() {
  return gulp.src(paths.styles, { allowEmpty: true })
    .pipe(gulpif(!global.IS_PRODUCTION, sourcemaps.init()))
    .pipe(sass({
      outputStyle: 'expanded',
      importer: moduleImporter(),
      includePaths: 'node_modules/',
    }))
    .on('error', notify.onError({
      title: 'Error compiling styles!',
    }))
    .pipe(gulpif(!global.IS_PRODUCTION, sourcemaps.write('./')))
    .pipe(gulp.dest('build'))
}
