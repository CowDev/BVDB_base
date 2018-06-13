/**
 * Requires
 */
var gulp            = require('gulp');
var gutil           = require('gulp-util');

// ENV
require('dotenv').config({path: '../../../.env'});

// SASS
var sass            = require('gulp-sass');
var prefix          = require('gulp-autoprefixer');
var crass           = require('gulp-crass');

// JS
var uglify          = require('gulp-uglify');

// IMG
var imagemin        = require('gulp-imagemin');

// Sync
var browserSync     = require('browser-sync');

// Optimization
var cache           = require('gulp-cache');
var del             = require('del');
var runSequence     = require('run-sequence');

// Deployment
var ftp             = require( 'vinyl-ftp' );

/**
 * Gulp tasks
 */

// Start browserSync server
gulp.task('browserSync', function() {
    browserSync.init({
        proxy: process.env.HOST,
        ghostMode: {
            clicks: false,
            location: false,
            scroll: false
        }
    })
})

// SASS
gulp.task('sass', function (){
    gulp.src(['./dev/sass/styles.scss'])
        .pipe(sass({
            includePaths: ['./dev/sass','./dev/sass/base','./dev/sass/layout','./dev/sass/sections'],
            outputStyle: 'expanded'
        }))
        .on('error', swallowError)
        .pipe(prefix(
            "last 1 version", "> 1%", "ie 8", "ie 7"
        ))
        .pipe(gulp.dest('./dev/css'))
        .pipe(crass({pretty:false}))
        .pipe(gulp.dest('./prod/css'))
        .pipe(browserSync.reload({ // Reloading with Browser Sync
            stream: true
        }));
});

// JS
gulp.task('uglify', function(){
    gulp.src('./dev/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./prod/js'));
});

// IMG
gulp.task('images', function() {
    return gulp.src('./dev/img/**/*.+(png|jpg|jpeg|gif|svg)')
    // Caching images that ran through imagemin
        .pipe(cache(imagemin({
            interlaced: true,
        })))
        .pipe(gulp.dest('./prod/img'))
});

// Cleaning
gulp.task('clean', function() {
    return del.sync('prod').then(function(cb) {
        return cache.clearAll(cb);
    });
})

gulp.task('clean:prod', function() {
    return del.sync(['./prod/**/*', '!./prod/img', '!./prod/img/**/*']);
});

// Watcher
gulp.task('watch', function() {
    gulp.watch('./dev/sass/**/*.scss', ['sass']);
    gulp.watch('./dev/js/**/*.js', ['uglify']);
    gulp.watch('./prod/js/*.js', browserSync.reload);
    gulp.watch('./*.php', browserSync.reload);
    gulp.watch('./**/*.php', browserSync.reload);
    gulp.watch('./dev/img/*', ['images']);
});

// Prevent errors from breaking watch
function swallowError (error) {

    // If you want details of the error in the console
    console.log(error.toString())

    this.emit('end')
}

/**
 * Watch, Build & Deploy
 */

// Default function (for dev)
gulp.task('default', function(callback) {
    runSequence(['sass', 'uglify', 'browserSync'], 'watch',
        callback
    )
})

// Build for production
gulp.task('build', function(callback) {
    runSequence(
        'clean:prod',
        'sass',
        ['uglify', 'images'],
        callback
    )
})

gulp.task( 'deploy', function () {

    // Set connection
    var conn = ftp.create( {
        host:     process.env.FTP_HOST,
        user:     process.env.FTP_USER,
        password: process.env.FTP_PASS,
        parallel: 10,
        log:      gutil.log
    } );

    var globs = [
        'inc/**',
        'prod/**',
        '*.css',
        '*.php'
    ];

    // using base = '.' will transfer everything to /public_html correctly
    // turn off buffering in gulp.src for best performance

    return gulp.src( globs, { base: '.', buffer: false } )
        .pipe( conn.newer( '/' ) ) // only upload newer files
        .pipe( conn.dest( process.env.FTP_PATH ) );

} );