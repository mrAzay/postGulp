const gulp = require('gulp');
const postcss = require('gulp-postcss');//поддержка postcss плагинов
const precss = require('precss');//как scss только лучше
const rename = require('gulp-rename');//изменяет имя файла
const autoprefixer = require('autoprefixer');//ставит префиксы в css
const sourcemaps = require('gulp-sourcemaps');//создает карту css
const cssnano = require('gulp-cssnano');//минифицирует цмм
const atImport = require('postcss-import');//импортирует css
const watch = require('gulp-watch');
const browserSync = require('browser-sync');
const uncss = require('postcss-uncss');
const fontMagician = require('postcss-font-magician');
const lost = require('lost');
const rigger = require('gulp-rigger');


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
                    html: ['src/**/*.html']
                })//файлы за которыми следит uncss, чтобы удалять классы, которые не используются, ignore: ['.fade'] для игнора классов
            ]) //подключает плагины postcss
        )
        .pipe(cssnano())//минифицируем
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

gulp.task('watch', () => {
    //Следим за изменениями в файлах и директориях и запускаем задачи, если эти изменения произошли
    gulp.watch('src/style/**/*.pcss', gulp.parallel('css'));
    gulp.watch('src/**/*.html', gulp.parallel('html'));
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
        'html'
    ),
);