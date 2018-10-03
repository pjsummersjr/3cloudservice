var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var tsify = require("tsify");
var ts = require("gulp-typescript");
var watch = require("gulp-watch");
var path = require('path');
var log = require('fancy-log');

var tsProject = ts.createProject("tsconfig.json");

var env = "production"
if(process.argv[2]){
    env = process.argv[2].split('=')[1];
}

gulp.task("default", ["server"]);
/**
 * This builds the server component
 */
gulp.task("server", function () {
    return tsProject.src()
        .on('end', function(){
            //log(`Arg: ${env}`);
        })
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist"));
});