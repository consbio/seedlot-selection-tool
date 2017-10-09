import gulp from 'gulp'
import sass from 'gulp-sass'
import envify from 'envify/custom'
import gulpUtil from 'gulp-util'
import browserify from 'browserify'
import tildeImporter from 'node-sass-tilde-importer'
import source from 'vinyl-source-stream'

gulp.task('sass', () => {
    return gulp.src('./sass/seedsource.scss')
        .pipe(sass({importer: tildeImporter}).on('error', sass.logError))
        .pipe(gulp.dest('./source/sst/static/css'))
})

gulp.task('js', () => {
    browserify({
        entries: './seedsource-core/js/index.js',
        paths: ['./js', './seedsource-core/js'],
        extensions: ['.jsx'],
        transform: [
            // ['envify', {NODE_ENV: 'production', global: true}]
        ]
    })
        .transform('babelify', {presets: ['es2015', 'react']})
        // .transform('uglifyify', {global: true})
        .bundle()
        .on('error', gulpUtil.log)
        .pipe(source('seedsource.js'))
        .pipe(gulp.dest('./source/sst/static/js'))
})

gulp.task('default', ['sass', 'js'])

gulp.task('watch', () => {
    gulp.watch('./sass/**/*.scss', ['sass'])
    gulp.watch('./seedsource-core/sass/**/*.scss', ['sass'])
    gulp.watch('./js/**/*.{js,jsx}', ['js'])
    gulp.watch('./seedsource-core/js/**/*.{js,jsx}', ['js'])
})
