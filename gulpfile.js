var gulp    	= require('gulp');
var concat  	= require('gulp-concat');
var changed 	= require('gulp-changed');
var phpConect 	= require('gulp-connect-php');
var nano    	= require('gulp-cssnano');
var sass 		= require('gulp-sass');
var uglify		= require('gulp-uglify');
var bs      	= require('browser-sync');
var htmlmin     = require('gulp-htmlmin');
var phpmin		= require('gulp-php-minify');
var sourcemaps	= require('gulp-sourcemaps');
var gulpIgnore  = require('gulp-ignore');
var jsonMinify 	= require('gulp-json-minify');

gulp.task('default', ['browser-sync']);

gulp.task('php', function() {
    phpConect.server({ base: 'build/', port: 8010, keepalive: true});
});

gulp.task('browser-sync', ['php','watch'], function() {
    bs({
        proxy: '127.0.0.1:8010',
        port: 3000,
        open: true,
        notify: false
    });
    gulp.watch(["./build/**/*.html","./build/**/*.php","./build/**/*.js","./build/**/*.json","./build/img/**/*"]).on('change', bs.reload);
});

gulp.task('watch', ['html-include', 'php-files', 'sass', 'scripts', 'json', 'assets', 'fonts'], function() {
    gulp.watch(['./source/**/*.html', './source/**/*.php'],  ['html-include']);
	gulp.watch('./source/inc/*inc.php', ['php-files']);
    gulp.watch('./source/**/*.js', ['scripts']);
	gulp.watch('./source/**/*.json', ['json']);
    gulp.watch('./source/**/*.scss', ['sass']);
    gulp.watch('./source/img/**/*', ['assets']);
    gulp.watch('./source/fonts/**/*', ['fonts']);
});
 
gulp.task('html-include', function() {    
    return gulp.src(['./source/**/*.html','./source/**/*.php','!./source/**/*.inc.php'])
		.pipe(changed('./build/**/*')) 
		.pipe(htmlmin({
        collapseWhitespace: true,
        ignoreCustomFragments: [ /<%[\s\S]*?%>/, /<\?[=|php]?[\s\S]*?\?>/ ]
      }))
      .pipe(gulp.dest('./build/'));
});

gulp.task('php-files', function() {    
    return gulp.src('./source/inc/*inc.php') // Ignores template files
        .pipe(changed('./build/**/*')) 
		.pipe(phpmin())
        .pipe(gulp.dest('./build/inc/'));
});

gulp.task('scripts', function() {
    return gulp.src('./source/js/*.js')
        .pipe(changed('./build/js/**/*'))
		.pipe(concat('scripts.min.js'))
	    .pipe(uglify())
        .pipe(gulp.dest('./build/js/'));
});

gulp.task('json', function() {
    return gulp.src('./source/js/*.json')
        .pipe(changed('./build/js/*.json'))
		.pipe(jsonMinify())
        .pipe(gulp.dest('./build/js/'));
});

gulp.task('assets', function() {
    return gulp.src('./source/img/**/*')
        .pipe(changed('./build/img/**/*')) // Ignore unchanged files
        .pipe(gulp.dest('./build/img/'));
});

gulp.task('fonts', function() {
    return gulp.src('./source/fonts/**/*')
        .pipe(changed('./build/fonts/**/*')) // Ignore unchanged files
        .pipe(gulp.dest('./build/fonts'));
});

gulp.task('sass', function() {
    return gulp.src('./source/sass/*.scss') 
		.pipe(sass())
        .pipe(concat('style.min.css'))
        .pipe(nano()) // Only enable for deployment, too slow for development
        .pipe(gulp.dest('./build/css/'))
        .pipe(bs.stream());
});
