var gulp = require("gulp");
const sass = require('gulp-sass');
var minCss = require("gulp-minify-css");
var rename = require("gulp-rename");
var cleanCSS = require("gulp-clean-css");
var uglify = require("gulp-uglify");
var gulpIf = require("gulp-if");
var strip = require('gulp-strip-comments');
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
const fibers = require('fibers');
const postcss = require('gulp-postcss');
sass.compiler = require('sass');

var options = minimist(process.argv.slice(2)); // コマンドライン・オプション読み込み
var isProduction = options.env == "production"; // --env=productionと指定されたらリリース用
var parentTaskName = process.argv[2] || "default"; // 指定されたタスク名
var isWatch = parentTaskName == "watch"; // watchタスクで起動されたか

const paths = {
  html: {
    src: 'sources/modules/pages/**/*.html',
    dest: 'public_html/'
  },
  css: {
    src: 'sources/assets/sass/**/*.scss',
    dest: 'public_html/css/'
  },
  js: {
    src: 'sources/assets/js/*.js',
    dest: 'public_html/js/'
  },
  images: {
    src: 'sources/assets/images/**/*.+(png|jpg|gif|svg)',
    dest: 'public_html/images'
  }, 
  fonts: {
    src: 'sources/assets/fonts/**/*',
    dest: 'public_html/fonts'
  }
}

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
//---------------------------------------------------
// HTML
//---------------------------------------------------
gulp.task("file-include", function (done) {
  gulp
    .src([paths.html.src])
    .pipe(
      fileInclude({
        prefix: "@@",
        basepath: "@file",
      })
    )
    .pipe(gulp.dest(paths.html.dest));

  done();
});
//---------------------------------------------------
// JAVASCRIPT
//---------------------------------------------------
gulp.task('js', function(done){
   gulp.src(paths.js.src)
  .pipe(concat('all.js'))
  .pipe(uglify()) 
  .pipe(rename("all.min.js"))
  .pipe(gulp.dest(paths.js.dest));
  done();
})
//---------------------------------------------------
// CSS
//---------------------------------------------------
gulp.task('sass', () => {
  return gulp.src(paths.css.src)
    .pipe(sass({
      fiber: fibers,
      style: 'expanded'
    }).on('error', sass.logError))
    .pipe(postcss([
      require('autoprefixer')({
        grid: "autoplace",
        cascade: false
      }),
      require('css-mqpacker')
    ]))
    .pipe(strip())
    .pipe(cleanCSS())
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(gulp.dest(paths.css.dest))
});
//---------------------------------------------------
// IMAGES
//---------------------------------------------------
gulp.task("images", function () {
  return (
    gulp
      .src(paths.images.src)
      .pipe(
        cache(
          imagemin({
            interlaced: true,
          })
        )
      )
      .pipe(gulp.dest(paths.images.dest))
  );
});

gulp.task("fonts", function () {
  return gulp
    .src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.dest));
});

gulp.task("watch", function (done) {
  gulp.watch("sources/assets/sass/**/*.scss", gulp.task("sass"));
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

// gulp.task("html", function () {
//   return gulp
//     .src("sources/modules/components/**/*.html")
//     .pipe(
//       htmlhint({
//         "doctype-first": false,
//         "tagname-lowercase": true,
//         "attr-no-duplication": true,
//         "attr-value-double-quotes": true,
//         "alt-require": true,
//         "id-unique": true,
//         "id-class-value": false,
//         "src-not-empty": true,
//         "inline-style-disabled": true,
//       })
//     )
//     .pipe(htmlhint.reporter());
// });

// Build Sequences
// ---------------
gulp.task(
  "default",
  gulp.series(
    "clean:public_html",
    "sass",
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
    "js",
    "file-include",
    "images",
    "fonts",
    function (done) {
      done();
    }
  )
);