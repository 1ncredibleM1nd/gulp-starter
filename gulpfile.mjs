import { src, dest, watch, parallel, series } from "gulp";
import gulpSass from "gulp-sass";
import sass from "sass";
import concat from "gulp-concat";
import uglify from "gulp-uglify-es";
import browserSyncModule from "browser-sync";
import clean from "gulp-clean";
import webp from "gulp-webp";
import imagemin from "gulp-imagemin";
import fonter from "gulp-fonter";
import ttf2woff2 from "gulp-ttf2woff2";
import newer from "gulp-newer";
import svgSprite from "gulp-svg-sprite";
import include from "gulp-include";
import autoprefixer from "gulp-autoprefixer";

const browserSync = browserSyncModule.create();
const scss = gulpSass(sass);
const uglifyES = uglify.default;

function pages() {
    return src("app/pages/*.html")
        .pipe(include({ includePaths: "app/components" }))
        .pipe(dest("app"))
        .pipe(browserSync.stream());
}

function fonts() {
    return src("app/fonts/src/*.*")
        .pipe(fonter({ formats: ["ttf", "woff"] }))
        .pipe(src("app/fonts/*.ttf"))
        .pipe(ttf2woff2())
        .pipe(dest("app/fonts"));
}

async function images() {
    return src(["app/images/src/*.*", "!app/images/src/*.svg"])
        .pipe(newer("app/images"))
        .pipe(webp())
        .pipe(src("app/images/src/*.*"))
        .pipe(newer("app/images"))
        .pipe(imagemin())
        .pipe(dest("app/images"));
}

function sprite() {
    return src("app/images/*svg")
        .pipe(svgSprite({ mode: { stack: { sprite: "../sprite.svg", example: true } } }))
        .pipe(dest("app/images"));
}

function styles() {
    return src("app/scss/*.scss")
        .pipe(autoprefixer({ overrideBrowserslist: ["last 10 versions"] }))
        .pipe(concat("style.min.css"))
        .pipe(scss({ outputStyle: "compressed" }).on("error", scss.logError))
        .pipe(dest("app/css"))
        .pipe(browserSync.stream());
}

function scripts() {
    return src(["node_modules/swiper/swiper-bundle.js", "app/js/main.js"])
        .pipe(concat("main.min.js"))
        .pipe(uglifyES())
        .pipe(dest("app/js"))
        .pipe(browserSync.stream());
}

function watching() {
    browserSync.init({
        server: { baseDir: "app/" },
    });
    watch(["app/images/src"], images);
    watch(["app/scss/*.scss"], styles);
    watch(["app/js/main.js"], scripts);
    watch(["app/components/*.*", "app/pages"], pages);
    watch(["app/*.html"]).on("change", browserSync.reload);
}

function cleanDist() {
    return src("dist").pipe(clean());
}

function building() {
    return src(
        [
            "app/css/style.min.css",
            "app/images/*.*",
            "!app/images/*.svg",
            "!app/images/stack",
            "app/fonts/*.*",
            "app/images/sprite.svg",
            "app/js/main.min.js",
            "app/**/*.html",
        ],
        { base: "app" }
    ).pipe(dest("dist"));
}

export { styles, images, sprite, scripts, watching, pages, fonts, build, defaultTask as default };

const build = series(cleanDist, building);
const defaultTask = parallel(styles, scripts, pages, watching);
