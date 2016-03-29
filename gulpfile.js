'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var eslint = require('gulp-eslint');

var lintPaths = [__dirname + '/test/*.js',__dirname + '/test/examples/*.js', __dirname + '/lib/*.js', __dirname + '/confib/*.js'];

gulp.task('eslint', () => {
  gulp.src(lintPaths)
  .pipe(eslint())
  .pipe(eslint.format());
});

gulp.task('test', ['eslint'], () => {
  gulp.src(__dirname + '/test/*.js')
  .pipe(mocha());
});

gulp.task('watch', () => {
  gulp.watch(lintPaths, ['test']);
});

gulp.task('default', ['test'], () => {
  console.log('running default tasks');
});
