const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const gcmq = require('gulp-group-css-media-queries');
const less = require('gulp-less');
const fs = require('fs');
const path = require('path');

const isDev = (process.argv.indexOf('--dev') !== -1);
const isProd = !isDev;
const isSync = (process.argv.indexOf('--sync') !== -1);

function clear(){
	return del('build/*');
}


const cssFilesArray = [
	'./src/constant/css/normalize.less',
];
pushFiles();

function pushFiles() {
	const files = fs.readdirSync(path.join(__dirname, '/src/css'), (err, files) => {
		if(err) throw err;
		return files;
	});

	files.forEach(el => {
		if(el.search(/.less/) !== -1)	cssFilesArray.push('./src/css/' + el);
	});
}

function styles(){
	return gulp.src(cssFilesArray)
				 .pipe(gulpif(isDev, sourcemaps.init()))
				 .pipe(concat('style.less'))
				 .pipe(less())
			   .pipe(gcmq())
			   .pipe(autoprefixer({
					 overrideBrowserslist: ['last 4 versions'],
					 cascade: false
					}))
					.pipe(gulpif(isProd, cleanCSS({
						level: 1
					})))
			   .pipe(gulpif(isDev, sourcemaps.write()))
			   .pipe(gulp.dest('./build'))
			   .pipe(gulpif(isSync, browserSync.stream()));
}

function html(){
	return gulp.src('./src/*.html')
			   .pipe(gulp.dest('./build'))
			   .pipe(gulpif(isSync, browserSync.stream()));
}

function fonts(){
	return gulp.src('./src/fonts/**/*')
							.pipe(gulp.dest('./build/fonts'));
}

function watch(){
	if(isSync){
		browserSync.init({
	        server: {
	            baseDir: "./build/",
	        }
	    });
	}

	gulp.watch('./src/css/**/*.less', styles);
	gulp.watch('./src/**/*.html', html);
}

let build = gulp.series(clear, gulp.parallel(styles, html, fonts));

gulp.task('build', build);
gulp.task('watch', gulp.series(build, watch));