module.exports = function(grunt) {

  grunt.initConfig({

    // pkg: grunt.file.readJSON('package.json'),

    transport: {
      options: {
        paths: ['..'],
        debug: false
      },
      build: {
        cwd: 'src/',
        src: 'js/*/*',
        dest: 'build/'
      }
    },

    // For Development
    concat: {
        options: {
            paths: ['..'],
            include: 'relative'
        },
        build2: {
            expand: true,
            cwd: 'build/',
            src: ['js/app/*', 'js/module/*'],
            dest: '../webapp/WEB-INF/static/dist/'
        }
    }

    // For Deployment

    // concat: {
    //     options: {
    //         paths: ['..'],
    //         include: 'relative'
    //     },
    //     build2: {
    //         expand: true,
    //         cwd: 'build/',
    //         src: ['js/app/*', 'js/module/*'],
    //         dest: 'build2/'
    //     }
    // },

    // uglify: {
    //   dist: {
    //     expand: true,
    //     cwd: 'build2/',
    //     src: ['js/app/*', 'js/module/*'],
    //     dest: '../webapp/WEB-INF/static/dist/'
    //   }
    // }
  });

  // 加载任务插件
  grunt.loadNpmTasks('grunt-cmd-transport');
  grunt.loadNpmTasks('grunt-cmd-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // 默认任务
  grunt.registerTask('default', ['transport', 'concat']);
  // grunt.registerTask('default', ['transport', 'concat', 'uglify']);

};