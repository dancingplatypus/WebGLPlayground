require ['_common'], () ->
  require ['jquery', 'glut', 'text!../shaders/f/f_my2.glsl'],
    ($, glut, shader) ->

      ws = glut.createWorkspace()
      ws.shader shader
      document.body.appendChild ws.renderer.domElement
      ws.run()
