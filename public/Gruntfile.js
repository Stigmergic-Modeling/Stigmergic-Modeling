module.exports = function(grunt) {

  grunt.initConfig({

    // pkg: grunt.file.readJSON('package.json'),

    transport: {
      options: {
        //paths: ['..'],
        //alias: {
        //  'jquery': '../lib/jquery.js',
        //  'bootstrap': '../lib/bootstrap.js',
        //  'd3': '../lib/d3.v3.js'
        //},
        debug: false
      },
      build: {
        cwd: 'src/',
        src: 'js/*/*',
        dest: 'build/'
      }
    },

    concat: {
      //dist: {
      //  src: 'build/src/*',
      //  dest: 'dist/workspace.js'
      //}
    },

    uglify: {
      dist: {
        expand: true,
        cwd: 'build/',
        src: 'js/*/*',
        dest: 'dist/'
      }
    }
  });

  // 加载任务插件
  grunt.loadNpmTasks('grunt-cmd-transport');
  grunt.loadNpmTasks('grunt-cmd-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // 默认任务
  grunt.registerTask('default', ['transport', 'uglify']);

};