import gulp from 'gulp'
import sass from 'gulp-sass'
import util from 'gulp-util'
import rename from 'gulp-rename'
import browserify from 'browserify'
import tildeImporter from 'node-sass-tilde-importer'
import source from 'vinyl-source-stream'

const production = !!util.env.production

gulp.task('sass', () => {
    return gulp.src('./sass/seedsource.scss')
        .pipe(
            sass({importer: tildeImporter, outputStyle: production ? 'compressed' : 'expanded'})
                .on('error', sass.logError)
        )
        .pipe(rename(production ? 'seedsource.min.css' : 'seedsource.css'))
        .pipe(gulp.dest('./source/sst/static/css'))
})

gulp.task('js', () => {
    let transform = []
    if (production) {
        transform = [
            ['envify', {NODE_ENV: 'production', global: true}]
        ]
    }

    let b = browserify({
        entries: './seedsource-core/js/index.js',
        paths: ['./js', './seedsource-core/js'],
        extensions: ['.jsx'],
        transform
    })
        .transform('babelify', {presets: ['es2015', 'react']})

    if (production) {
        b = b.transform('uglifyify', {global: true})
    }

    b = b.bundle()
        .on('error', util.log)
        .pipe(source(production ? 'seedsource.min.js' : 'seedsource.js'))
        .pipe(gulp.dest('./source/sst/static/js'))

    return b
})

gulp.task('default', ['sass', 'js'])

gulp.task('watch', () => {
    gulp.watch('./sass/**/*.scss', ['sass'])
    gulp.watch('./seedsource-core/sass/**/*.scss', ['sass'])
    gulp.watch('./js/**/*.{js,jsx}', ['js'])
    gulp.watch('./seedsource-core/js/**/*.{js,jsx}', ['js'])
})
