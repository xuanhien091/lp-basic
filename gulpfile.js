var gulp = require("gulp");
var sass = require("gulp-sass");
var uglify = require("gulp-uglify");
var gulpIf = require("gulp-if");
var cssnano = require("gulp-cssnano");
var imagemin = require("gulp-imagemin");
var del = require("del");
var cache = require("gulp-cache");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var plumber = require("gulp-plumber");
var concat = require("gulp-concat");
var minimist = require("minimist");
var sourcemaps = require("gulp-sourcemaps");
var browserSync = require("browser-sync").create();
var stripDebug = require("gulp-strip-debug");
var cssmin = require("gulp-cssmin");
var fileInclude = require("gulp-file-include");
var uncss = require("gulp-uncss");
var autoprefixer = require("gulp-autoprefixer");
var babel = require("gulp-babel");
var htmlhint = require("gulp-htmlhint");

var options = minimist(process.argv.slice(2)); // コマンドライン・オプション読み込み
var isProduction = options.env == "production"; // --env=productionと指定されたらリリース用
var parentTaskName = process.argv[2] || "default"; // 指定されたタスク名
var isWatch = parentTaskName == "watch"; // watchタスクで起動されたか

gulp.task("browserSync", function (done) {
  browserSync.init({
    server: {
      proxy: "localhost:3001",
      baseDir: "./public_html",
      open: true,
      online: false,
      ghostMode: {
        scroll: true,
      },
      logLevel: "info", // 'debug', 'info', 'silent', 'warn'
      logConnections: false,
      logPrefix: "Browser-Sync",
      notify: true,
    },
  });
  done();
});

gulp.task("file-include", function (done) {
  gulp
    .src(["sources/modules/pages/**/*.html"])
    .pipe(
      fileInclude({
        prefix: "@@",
        basepath: "@file",
      })
    )
    .pipe(gulp.dest("public_html/"));

  done();
});

//js minify
gulp.task("js", function (done) {
  gulp
    .src("sources/assets/js/**/*.js")
    .pipe(gulpIf(isWatch, plumber())) // watchタスクの場合、エラーが発生しても無視
    .pipe(gulpIf(!isProduction, sourcemaps.init())) // 本番以外はソースマップ初期化
    .pipe(
      babel({
        presets: ["@babel/preset-env"],
      })
    )
    .pipe(concat("all.js")) // Javascriptを結合
    .pipe(gulpIf(isProduction, stripDebug())) // 本番でははconsole.logを除去
    .pipe(uglify()) // all.jsを最小化
    .pipe(rename("all.min.js")) // all-min.jsにリネーム
    .pipe(gulpIf(!isProduction, sourcemaps.write("./"))) // 本番以外はソースマップ出力
    .pipe(gulp.dest("public_html/js/"));
  done();
});

gulp.task("sass", function () {
  return gulp
    .src("sources/assets/sass/**/*.scss")
    .pipe(sass().on("error", sass.logError)) // Passes it through a gulp-sass, log errors to console
    .pipe(gulp.dest("app/assets/css"))
    .pipe(
      browserSync.reload({
        stream: true,
      })
    );
});

gulp.task("css", function (done) {
  gulp
    .src("sources/assets/css/**/*.css")
    .pipe(gulpIf(isWatch, plumber())) // watchタスクの場合、エラーが発生しても無視
    .pipe(gulpIf(!isProduction, sourcemaps.init())) // 本番以外はソースマップ初期化
    .pipe(concat("all.css"))
    .pipe(autoprefixer())
    .pipe(cssmin())
    .pipe(rename("all.min.css")) // all-min.jsにリネーム
    .pipe(gulpIf(!isProduction, sourcemaps.write("./"))) // 本番以外はソースマップ出力
    .pipe(gulp.dest("public_html/css/"));
  done();
});

gulp.task("uncss", function () {
  return gulp
    .src("public_html/css/**/*.css")
    .pipe(
      uncss({
        html: ["public_html/**/*.html"],
      })
    )
    .pipe(gulp.dest("public_html/css/"));
});

gulp.task("watch", function (done) {
  gulp.watch("sources/assets/sass/**/*.scss", gulp.task("sass"));
  gulp.watch("sources/assets/css/**/*.css", gulp.task("css"));
  // gulp.watch('app/assets/css/**/*.css', gulp.task('auto-prefixer'));
  gulp.watch("sources/assets/fonts/*", gulp.task("fonts"));
  gulp.watch("sources/assets/images/*", gulp.task("images"));
  gulp.watch("sources/assets/js/**/*.js", gulp.task("js"));
  gulp.watch("sources/modules/**/**/*.html", gulp.task("file-include"));
  done();
});

gulp.task("reload", function () {
  gulp.watch("public_html/**/**/*.*", browserSync.reload);
});

gulp.task("images", function () {
  return (
    gulp
      .src("sources/assets/images/**/*.+(png|jpg|gif|svg)")
      // Caching images that ran through imagemin
      .pipe(
        cache(
          imagemin({
            interlaced: true,
          })
        )
      )
      .pipe(gulp.dest("public_html/images"))
  );
});

gulp.task("fonts", function () {
  return gulp.src("sources/assets/fonts/**/*").pipe(gulp.dest("public_html/fonts"));
});

gulp.task("clean:public_html", function (done) {
  del.sync([
    "public_html/**/*",
    "!public_html/images",
    "!public_html/images/**/*",
  ]);
  done();
});

gulp.task("cache:clear", function (callback) {
  return cache.clearAll(callback);
});

gulp.task("html", function () {
  return gulp
    .src("sources/modules/components/*.html")
    .pipe(
      htmlhint({
        "tagname-lowercase": true,
        "attr-lowercase": true,
        "attr-value-double-quotes": true,
        "attr-value-not-empty": false,
        "attr-no-duplication": true,
        "doctype-first": true,
        "tag-pair": true,
        "empty-tag-not-self-closed": true,
        "spec-char-escape": true,
        "id-unique": true,
        "src-not-empty": true,
        "title-require": true,
        "alt-require": true,
        "doctype-html5": true,
        "id-class-value": "dash",
        "style-disabled": false,
        "inline-style-disabled": false,
        "inline-script-disabled": false,
        "space-tab-mixed-disabled": "space",
        "id-class-ad-disabled": false,
        "href-abs-or-rel": false,
        "attr-unsafe-chars": true,
        "head-script-disabled": true,
      })
    )
    .pipe(htmlhint.reporter());
});

// Build Sequences
// ---------------
gulp.task(
  "default",
  gulp.series(
    "clean:public_html",
    "sass",
    "css",
    "js",
    "file-include",
    "images",
    "fonts",
    "browserSync",
    "watch",
    "reload",
    function (done) {
      done();
    }
  )
);

gulp.task(
  "build",
  gulp.series(
    "clean:public_html",
    "sass",
    "css",
    "js",
    "file-include",
    "images",
    "fonts",
    "uncss",
    function (done) {
      done();
    }
  )
);
