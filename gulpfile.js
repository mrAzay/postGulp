const gulp = require('gulp');
const postcss = require('gulp-postcss');//поддержка postcss плагинов
const precss = require('precss');//как scss только лучше
const rename = require('gulp-rename');//изменяет имя файла
const autoprefixer = require('autoprefixer');//ставит префиксы в css
const sourcemaps = require('gulp-sourcemaps');//создает карту css
const cssnano = require('gulp-cssnano');//минифицирует цмм
const atImport = require('postcss-import');//импортирует css
const browserSync = require('browser-sync');//запускает локальный сервер
const uncss = require('postcss-uncss');//даляет ненужный сss
const fontMagician = require('postcss-font-magician');//автодополнение шрифтов
const lost = require('lost');//сетка
const rigger = require('gulp-rigger');//объеденяет html
const webpack = require('webpack-stream');//нужен для работы с вебпаком
const gulpIf = require('gulp-if');//иф в галп файле
const ttf2woff = require("gulp-ttf2woff"); //конвертирует шрифты в веб-формат
const ttf2woff2 = require("gulp-ttf2woff2"); //конвертирует шрифты в веб-формат
const ttf2eot = require("gulp-ttf2eot"); //конвертирует шрифты в веб-формат
const imagemin = require("gulp-imagemin");//минифиатор имг
const recompress = require("imagemin-jpeg-recompress");//минифиатор имг+

let isDev = true;
let isProd = !isDev;

let webpackConfig = {
    output: {
        filename: 'script.min.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    },
    mode: isDev ? 'development' : 'production',
    devtool: isDev ? 'eval' : "none"
};


gulp.task('css', () => {
    return gulp.src('./src/style/*.pcss')
        .pipe(sourcemaps.init())
        .pipe(postcss([
                atImport(),
                precss(/* options */),
                fontMagician(),
                lost(),
                autoprefixer({
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
                }),
                 uncss({
                     html:['dist/index.html']
                 })
            //файлы за которыми следит uncss, чтобы удалять классы, которые не используются, ignore: ['.fade'] для игнора классов
            ]) //подключает плагины postcss
        )
        .pipe(cssnano())//минифицируемy
        .pipe(
            rename({
                suffix: '.min',
                extname: '.css'
            })
        )//изменяет имя файла
        .pipe(sourcemaps.write('maps'))//создаем карту
        .pipe(
            gulp.dest('./dist/style')
        )//кидает в папку с готовыми стилями
        .pipe(
            browserSync.reload({
                stream: true
            }));
});

gulp.task('html', () => {
    return gulp.src('./src/*.html')
        .pipe(rigger())
        .pipe(gulp.dest('./dist'))
        .pipe(
            browserSync.reload({
                stream: true
            }));
})

gulp.task('js', () => {
    return gulp.src('./src/script/script.js')
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest('./dist/script'))
        .pipe(
            browserSync.reload({
                stream: true
            }));
});

gulp.task("font-woff", () => {
    //перекидываем шрифты из директории src в dist, а заодно следим за новыми файлами, чтобы обновлять браузер, когда появляется шрифт
    return gulp
        .src("src/fonts/**/*.+(eot|svg|ttf|otf|woff|woff2)")
        .pipe(ttf2woff())
        .pipe(gulp.dest("dist/fonts/"))
        .pipe(
            browserSync.reload({
                stream: true,
            }),
        );
});

gulp.task("font-woff2", () => {
    //перекидываем шрифты из директории src в dist, а заодно следим за новыми файлами, чтобы обновлять браузер, когда появляется шрифт
    return gulp
        .src("src/fonts/**/*.+(eot|svg|ttf|otf|woff|woff2)")
        .pipe(ttf2woff2())
        .pipe(gulp.dest("dist/fonts/"))
        .pipe(
            browserSync.reload({
                stream: true,
            }),
        );
});

gulp.task("font-eot", () => {
    //перекидываем шрифты из директории src в dist, а заодно следим за новыми файлами, чтобы обновлять браузер, когда появляется шрифт
    return gulp
        .src("src/fonts/**/*.+(eot|svg|ttf|otf|woff|woff2)")
        .pipe(ttf2eot())
        .pipe(gulp.dest("dist/fonts/"))
        .pipe(
            browserSync.reload({
                stream: true,
            }),
        );
});

gulp.task("images", () => {
    //пережимаем изображения и складываем их в директорию dist
    return gulp
        .src("src/images/**/*.+(png|jpg|jpeg|gif|svg|ico)")
        .pipe(
            imagemin([
                recompress({
                    //Настройки сжатия изображений. Сейчас всё настроено так, что сжатие почти незаметно для глаза на обычных экранах. Можете покрутить настройки, но за результат не отвечаю.
                    loops: 4, //количество прогонок изображения
                    min: 70, //минимальное качество в процентах
                    max: 80, //максимальное качество в процентах
                    quality: "high", //тут всё говорит само за себя, если хоть капельку понимаешь английский
                }),
                imagemin.gifsicle(), //тут и ниже всякие плагины для обработки разных типов изображений
                imagemin.optipng(),
                imagemin.svgo(),
            ]),
        )
        .pipe(gulp.dest("dist/images"))
        .pipe(
            browserSync.reload({
                stream: true,
            }),
        )
});

gulp.task("deletefonts", () => {
    //задачи для очистки директории со шрифтами в dist. Нужна для того, чтобы удалить лишнее.
    return del.sync("dist/fonts/**/*.*");
});

gulp.task("deleteimg", () => {
    //аналогично предыдущей, но с картинками.
    return del.sync("dist/img/**/*.*");
});

gulp.task('watch', () => {
    //Следим за изменениями в файлах и директориях и запускаем задачи, если эти изменения произошли
    gulp.watch('src/style/**/*.pcss', gulp.parallel('css'));
    gulp.watch('src/**/*.html', gulp.parallel('html'));
    gulp.watch('src/**/*.js', gulp.parallel('js'));
    gulp.watch(
        "src/fonts/**/*.*",
        gulp.parallel("font-woff", "font-woff2", "font-eot"),
    );
    gulp.watch("src/img/**/*.*", gulp.parallel("images"));
});



gulp.task('browser-sync', () => {
    //настройки лайв-сервера
    browserSync.init({
        server: {
            baseDir: './dist', //какую папку показывать в браузере
        },
        browser: ['chrome'], //в каком браузере
        //tunnel: ' ', //тут можно прописать название проекта и дать доступ к нему через интернет. Работает нестабильно, запускается через раз. Не рекомендуется включать без необходимости.
        //tunnel:true, //работает, как и предыдущяя опция, но присваивает рандомное имя. Тоже запускается через раз и поэтому не рекомендуется для включения
        host: '192.168.0.104', //IP сервера в локальной сети. Отключите, если у вас DHCP, пропишите под себя, если фиксированный IP в локалке.
    });
});

gulp.task(
    'default',
    gulp.parallel(
        'browser-sync',
        'watch',
        'css',
        'html',
        'js',
        "font-woff",
        "font-eot",
        "font-woff2",
        "images"
    ),
);