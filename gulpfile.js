const gulp = require("gulp");
const sass = require("gulp-sass");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const cache = require("gulp-cache");
const uglify = require("gulp-uglify");
const concat = require("gulp-concat");
const fileInclude = require("gulp-file-include");
const htmlhint = require("gulp-htmlhint");
const postcss = require("gulp-postcss");
const cleanCSS = require("gulp-clean-css");

const del = require("del");
const browserSync = require("browser-sync").create();
const fibers = require("fibers");
const webpack = require("webpack-stream");

sass.compiler = require("sass");

const paths = {
  html: {
    src: "pages/**/*.html",
    dest: "dest/",
  },
  components: {
    src: "components/**/*.html",
    dest: "dest/",
  },
  css: {
    src: "scss/*.scss",
    reloadSrc: "scss/**/*.scss",
    dest: "dest/css/",
  },
  js: {
    src: "js/*.js",
    dest: "dest/js/",
  },
  images: {
    src: "images/**/*.+(png|jpg|gif|svg)",
    dest: "dest/images",
  },
  // TODO: Uncomment when use
  // fonts: {
  //   src: 'fonts/**/*',
  //   dest: 'dest/fonts'
  // }
};
//---------------------------------------------------
// BUILD SERVER
//---------------------------------------------------
gulp.task("build-server", function (done) {
  browserSync.init({
    files: ["home.html"],
    server: {
      proxy: "localhost:3001",
      baseDir: "./dest",
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
gulp.task("js", function (done) {
  gulp
    .src(paths.js.src)
    .pipe(concat("all.js"))
    .pipe(uglify())
    .pipe(rename("all.min.js"))
    .pipe(gulp.dest(paths.js.dest));
  done();
});

//---------------------------------------------------
// WEBPACK
//---------------------------------------------------
gulp.task("webpack", () => {
  return gulp
    .src("js/")
    .pipe(webpack(require("./webpack.config.js")))
    .pipe(gulp.dest(paths.js.dest));
});
//---------------------------------------------------
// CSS
//---------------------------------------------------
gulp.task("sass", (done) => {
  gulp
    .src(paths.css.src)
    .pipe(
      sass({
        fiber: fibers,
        style: "expanded",
      }).on("error", sass.logError)
    )
    .pipe(
      postcss([
        require("autoprefixer")({
          grid: "autoplace",
          cascade: false,
        }),
        require("css-mqpacker"),
      ])
    )
    .pipe(cleanCSS())
    .pipe(
      rename({
        extname: ".min.css",
      })
    )
    .pipe(gulp.dest(paths.css.dest))
    .pipe(browserSync.reload({ stream: true }));

  done();
});
//---------------------------------------------------
// IMAGES
//---------------------------------------------------
gulp.task("images", function () {
  return gulp
    .src(paths.images.src)
    .pipe(
      cache(
        imagemin({
          interlaced: true,
        })
      )
    )
    .pipe(gulp.dest(paths.images.dest));
});
//---------------------------------------------------
// TODO Uncomment when use (create font folder)
// FONT
//---------------------------------------------------
// gulp.task("fonts", function () {
//   return gulp
//     .src(paths.fonts.src)
//     .pipe(gulp.dest(paths.fonts.dest));
// });
//---------------------------------------------------
// CHECK HTML
//---------------------------------------------------
gulp.task("html", function () {
  return gulp
    .src(paths.components.src)
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
        "tag-pair": false,
      })
    )
    .pipe(htmlhint.reporter());
});
//---------------------------------------------------
// WATCH FILES
//---------------------------------------------------
gulp.task("watch-files", function (done) {
  gulp.watch(paths.css.reloadSrc, gulp.task("sass"));
  // gulp.watch(paths.fonts.src, gulp.task("fonts")); // TODO Uncomment when use
  gulp.watch(paths.images.src, gulp.task("images"));
  gulp.watch(paths.js.src, gulp.task("js"));
  gulp.watch(paths.components.src, gulp.task("file-include"));
  gulp.watch(paths.html.src, gulp.task("file-include"));
  gulp.watch(paths.components.src, gulp.task("html"));

  gulp.watch("dest/**/*.*", gulp.task("browser-reload"));

  done();
});
//---------------------------------------------------
// BROWSER RELOAD
//---------------------------------------------------
gulp.task("browser-reload", function (done) {
  browserSync.reload();
  done();
  console.log("Browser reload completed");
});
//---------------------------------------------------
// CLEAN DEST
//---------------------------------------------------
gulp.task("clean:dest", function (done) {
  del.sync(["dest/**/*", "!dest/images", "!dest/images/**/*"]);
  done();
});
//---------------------------------------------------
// CACHE DEST
//---------------------------------------------------
gulp.task("cache:clear", function (callback) {
  return cache.clearAll(callback);
});

// Build Sequences
// ---------------
gulp.task(
  "default",
  gulp.series(
    "build-server",
    "clean:dest",
    "sass",
    "webpack",
    "file-include",
    "images",
    // "fonts", // TODO Uncomment when use
    "watch-files",
    function (done) {
      done();
    }
  )
);
