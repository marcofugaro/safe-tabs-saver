import gulp from 'gulp'
import { paths } from '../gulpfile'
import { scripts, styles, markup, images, manifest } from '.'
import io from 'socket.io'

// TODO add bundle instruction to console
export function watch() {
  const socket = io.listen(process.env.WEBSOCKET_PORT)
  const triggerFileChange = (done) => {
    socket.emit('file changed')
    done()
  }

  gulp.watch('src/**/*.js', gulp.series(scripts, triggerFileChange))
  gulp.watch('src/**/*.scss', gulp.series(styles, triggerFileChange))
  gulp.watch(paths.manifest, gulp.series(manifest, triggerFileChange))
  gulp.watch(paths.images, gulp.series(images, triggerFileChange))
  gulp.watch(paths.markup, gulp.series(markup, triggerFileChange))
}
