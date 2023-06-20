const gulp = require("gulp");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const concat = require("gulp-concat");

// Define a 'build' task
gulp.task("build", function () {
  return gulp
    .src("src/**/*.js") // Source files to include in the build
    .pipe(babel()) // Transpile using Babel
    .pipe(uglify()) // Minify the code
    .pipe(concat("bundle.min.js")) // Concatenate into a single file
    .pipe(gulp.dest("dist")); // Output directory for the build artifacts
});

// Define a 'watch' task to monitor changes and trigger the build task
gulp.task("watch", function () {
  gulp.watch("src/**/*.js", gulp.series("build"));
});
