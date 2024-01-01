import gulp from "gulp"
import concat from "gulp-concat"
import rename from "gulp-rename"
import { deleteAsync as del } from "del"
// BrowserSync
import browserSync, { reload, stream } from "browser-sync"
const bsync = browserSync.create()
//html
import htmlmin from "gulp-htmlmin"
//css
import cleanCss from "gulp-clean-css"
import autopref from "gulp-autoprefixer"
import dartSass from "sass"
import gulpSass from "gulp-sass"
const sass = gulpSass(dartSass)
//js
import uglifyjs from "gulp-uglify-es"
const uglify = uglifyjs.default
//img
import imagemin from "gulp-imagemin"
import recompress from "imagemin-jpeg-recompress"
import pngquant from "imagemin-pngquant"
// off plagins
import svgmin from "gulp-svgmin"


const clean = () => del("dist")

const html = () => {
	return gulp.src([
		'./src/html/head.html',
		'./src/html/main.html',
		'./src/html/footer.html'
	])
	.pipe(concat('index.html')) //minification html
	.pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
	.pipe(gulp.dest('./dist'))
	.pipe(bsync.stream())
}
const css = () => {
	return gulp.src([
		'./src/scss/**/*.scss',
		'!./src/scss/**/_*.scss'
	])
	.pipe(sass({
		outputStyle: 'compressed'
	})
	.on('error', sass.logError))
	.pipe(autopref({
		overrideBrowserslist: ['last 8 versions'],
		browsers: [
			'Android >= 4',
			'Chrome >= 20',
			'Firefox >= 24',
			'Explorer >= 11',
			'iOS >= 6',
			'Opera >= 12',
			'Safari >= 6',
		],
	}))
	.pipe(cleanCss({
		level: 2
	}))
	.pipe(concat('index.min.css'))
	.pipe(gulp.dest('dist/css'))
	.pipe(bsync.stream())
}
const js = () => {
	return gulp.src("./src/js/**/*.js")
	.pipe(uglify())
	.pipe(rename({
		extname: ".min.js"
	}))
	.pipe(gulp.dest("dist/js"))
	.pipe(bsync.stream())
}


const img = () => {
	return gulp.src('src/img/**/*.+(png|jpg|jpeg|gif|svg|ico)')
	.pipe(imagemin({
		interlaced: true,
			progressive: true,
			optimizationLevel: 5,
		},
		[
			recompress({
				loops: 6,
				min: 50,
				max: 90,
				quality: 'high',
				use: [pngquant({
					quality: [0.8, 1],
					strip: true,
					speed: 1
				})],
			}),
			imagemin.gifsicle,
			imagemin.optipng,
			imagemin.svgo
		], ), )
	.pipe(gulp.dest('dist/img'))
}

const Watch = () => {
	const r = () => bsync.stream()
	gulp.watch("src/html/**", gulp.series(r, html))
	gulp.watch("src/scss/**/*.scss", (r, css))
	gulp.watch("src/js/**", gulp.series(r, js))
	gulp.watch("src/img/**", img)
}

const browser = () => {
	bsync.init({
		server: {baseDir: "./dist",},
		notify: false,
		// online: false
	})

	gulp.watch("src/html/**",  html)
	gulp.watch("src/scss/**/*.scss", css)
	gulp.watch("src/js/**", js)
}

export const build = gulp.series(
	clean,
		gulp.parallel(
			html,
			css,
			js,
			img
		)
)
export const dev = gulp.series(build, browser)