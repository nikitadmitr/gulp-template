const { src, dest, series, parallel, watch } = require('gulp');
const clean = require('gulp-clean');
const panini = require("panini");
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();

const srcPath = 'app';
const destPath = 'dist';

const paths = {
    html: {
        src: [`${srcPath}/pages/**/*.html`],
        dest: destPath
    },
    images: {
        src: [`${srcPath}/images/*`],
        dest: `${destPath}/images`,
    },
    styles: {
        src: [`${srcPath}/scss/**/*.scss`],
        dest: `${destPath}/css`,
    },
    scripts: {
        src: [`${srcPath}/js/**/*.js`],
        dest: `${destPath}/js`,
    },
};

function cleaning() {
    return src(destPath)
        .pipe(clean());
}

function html() {
    panini.refresh();
    return src(paths.html.src)
        .pipe(panini({
            root: `${srcPath}/pages`,
            layouts: `${srcPath}/layouts/`,
            partials: `${srcPath}/partials/`,
            data: `${srcPath}/data/`
        }))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(dest(paths.html.dest))
        .pipe(browserSync.stream());
}

function images() {
    return src(paths.images.src)
        .pipe(imagemin())
        .pipe(dest(paths.images.dest))
        .pipe(browserSync.stream());
}

function styles() {
    return src(paths.styles.src)
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(autoprefixer({ overrideBrowserslist: ['last 2 versions', 'not dead'] }))
        .pipe(concat('style.min.css'))
        .pipe(cleanCSS({ level: 1 }))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(paths.styles.dest))
        .pipe(browserSync.stream());
}

function scripts() {
    return src(paths.scripts.src)
        .pipe(sourcemaps.init())
        .pipe(concat('main.min.js'))
        .pipe(babel({ presets: ['@babel/env'], compact: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(dest(paths.scripts.dest))
        .pipe(browserSync.stream());
}

function serve() {
    browserSync.init({
        server: './dist',
        port: 3000
    });

    watch([`${srcPath}/**/*.html`, `${srcPath}/data/*.json`], html);
    watch(paths.images.src, images);
    watch(paths.styles.src, styles);
    watch(paths.scripts.src, scripts);
}

exports.default = series(cleaning, parallel(html, images, styles, scripts), serve);