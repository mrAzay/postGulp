const gulp = require('gulp');
const postcss = require('gulp-postcss');//поддержка postcss плагинов
const precss = require('precss');//как scss только лучше
const rename = require('gulp-rename');//изменяет имя файла
const autoprefixer = require('autoprefixer');//ставит префиксы в css
const sourcemaps = require('gulp-sourcemaps');//создает карту css
const cssnano = require('gulp-cssnano');

gulp.task('css', function () {
    return gulp.src('./src/style/**/*.pcss')
        .pipe(sourcemaps.init())
        .pipe(postcss([
                precss(/* options */),
                autoprefixer({
                    overrideBrowserslist: ["last 8 versions"],
                    browsers: [
                        "Android >= 4",
                        "Chrome >= 20",
                        "Firefox >= 24",
                        "Explorer >= 11",
                        "iOS >= 6",
                        "Opera >= 12",
                        "Safari >= 6",
                    ],
                })
            ]) //подключает плагины postcss
        )
        .pipe(cssnano())//минифицируем
        .pipe(sourcemaps.write('.'))//оздаем карту
        .pipe(
            rename({
                suffix: ".min",
                extname: ".css"
            })
        )//изменяет имя файла
        .pipe(
            gulp.dest('./dist/style')
        );//кидает в папку с готовыми стилями
});