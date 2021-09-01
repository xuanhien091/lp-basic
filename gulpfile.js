var gulp = require("gulp");
var sass = require("gulp-sass");
var minCss = require("gulp-minify-css");
var rename = require("gulp-rename");

var uglify = require("gulp-uglify");
var gulpIf = require("gulp-if");

var imagemin = require("gulp-imagemin");
var del = require("del");
var cache = require("gulp-cache");
var uglify = require("gulp-uglify");

var plumber = require("gulp-plumber");
var concat = require("gulp-concat");
var minimist = require("minimist");
var sourcemaps = require("gulp-sourcemaps");
var browserSync = require("browser-sync").create();
var stripDebug = require("gulp-strip-debug");

var fileInclude = require("gulp-file-include");

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

gulp.task("build-css", function () {
  return gulp
    .src("sources/assets/sass/**/*.scss")
    .pipe(
      sass({
        outputStyle: "expanded",
      }).on("error", sass.logError)
    )
    .pipe(autoprefixer())
    .pipe(gulp.dest("public_html/css/"))
    .pipe(minCss())
    .pipe(rename({ extname: ".min.css" }))
    .pipe(gulp.dest("public_html/css/"));
});

gulp.task("watch", function (done) {
  gulp.watch("sources/assets/sass/**/*.scss", gulp.task("build-css"));
  gulp.watch("sources/assets/fonts/*", gulp.task("fonts"));
  gulp.watch("sources/assets/images/*", gulp.task("images"));
  gulp.watch("sources/assets/js/**/*.js", gulp.task("js"));
  gulp.watch("sources/modules/**/**/*.html", gulp.task("file-include"));
  gulp.watch("sources/modules/**/**/*.html", gulp.task("html"));
  done();
});

gulp.task("reload", function () {
  gulp.watch("public_html/**/**/*.*", browserSync.reload);
});

gulp.task("images", function () {
  return (
    gulp
      .src("sources/assets/images/**/*.+(png|jpg|gif|svg)")
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
  return gulp
    .src("sources/assets/fonts/**/*")
    .pipe(gulp.dest("public_html/fonts"));
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
    .src("sources/modules/components/**/*.html")
    .pipe(
      htmlhint({
        "doctype-first": false,
        "tagname-lowercase": true,
        "attr-no-duplication": true,
        "attr-value-double-quotes": true,
        "alt-require": true,
        "id-unique": true,
        "id-class-value": false,
        "src-not-empty": true,
        "inline-style-disabled": true,
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
    "build-css",
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
    "build-css",
    "js",
    "file-include",
    "images",
    "fonts",
    function (done) {
      done();
    }
  )
);
