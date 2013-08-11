module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    browserify: {
      build: {
        src: ['src/*.js'],
        dest: 'www/Toneblaster.js'
      }
    },
    
    jshint: {
      files: {
        src: [ 'src/*' ]
      },
      options: {
        esnext: true,
        eqnull: true,
        funcscope: true
      }
    },

    watch: {
      files: [ 'src/*.js' ],
      tasks: [ 'jshint', 'browserify' ]
    },

    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: [ 'test/*.js' ],
        dest: 'www/test.js',
      },
    }
    
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['jshint', 'browserify']);
  grunt.registerTask('spec', ['concat' ]);

};
