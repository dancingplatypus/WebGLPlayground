module.exports = (grunt) ->

  grunt.initConfig(

      jade:
        options:
          pretty: true

        compile:
          ext: '.html'
          expand: true
          src: [ '**/*.jade']
          cwd: '_source'
          dest: 'output/public/'

          options:
            data:
              debug: true
              _: require 'lodash'

      coffee:
        app:
          ext: ".js"
          expand: true
          src: [ "**/*.coffee" ]
          cwd: "_source"
          dest: "output/public/"
          bare: true
          onlyIf: 'newer'
        s_app:
          ext: ".js"
          expand: true
          src: [ "!node_modules/**/*.coffee", "**/*.coffee" ]
          cwd: "_server"
          dest: "output/"
          bare: true
          onlyIf: 'newer'

      less:
        style:
          files: 'output/public/css/style.css' : '_source/css/style.less'
          options: compress: false

      clean:
        all: ['output/', 'pre-stage/']

      copy:
        main:
          files: [
            { expand:true, src: [ '**/*.js', '**/*.glsl', '**.ico' ], cwd: '_source/', dest: 'output/public/', onlyIf: 'newer' }
          ]
        serv:
          files: [
            { expand: true, src: [ '**' ], cwd: '_server/', dest: 'output/', onlyIf: 'newer' }
          ]
  )

  grunt.loadNpmTasks 'grunt-contrib-jade'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-less'
  grunt.loadNpmTasks 'grunt-contrib-copy'

  grunt.registerTask 'default', ['copy', 'coffee', 'jade', 'less']
