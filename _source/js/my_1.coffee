require ['_common'], () ->
  require ['jquery', 'three'
      'glut'
      'text!../shaders/f/f_my1.glsl'
      'text!../shaders/v/v_my1.glsl'
    ],
    ($, _3, glut, f_my1, v_my1) ->

      opt =
          w: window.innerWidth
          h: window.innerHeight
          resize: true
          fov: 75
          near: 0
          far: 1000

      ws = glut.createWorkspace opt

      ws.shader f_my1
      ws.loop = () ->
        shaderMaterial.uniforms.time.value = ((new Date()).getTime() % 100000) * 1.0
      ws.run()


      # first things first...
      renderer = new _3.WebGLRenderer()

      aspect = opt.w / opt.h

      view_cam =
        fov : Math.PI / 2.0
        height: if opt.w > opt.h then 1 else 1 / aspect
        width:  if opt.w > opt.h then aspect else 1

      view_cam.dx = view_cam.width / opt.w
      view_cam.dy = view_cam.height / opt.h
      view_cam.p0 = x: -view_cam.width / 2, y: -view_cam.height / 2
      view_cam.pf = x: -view_cam.p0.x, y: -view_cam.p0.y

      console.log view_cam

      # create simple scene and camera
      scene = new _3.Scene()
      # cam defined as left, right, top, bottom
      camera = new _3.OrthographicCamera view_cam.p0.x, view_cam.pf.x,
        view_cam.pf.y, view_cam.p0.y
      renderer.setSize opt.w, opt.h

      document.body.appendChild renderer.domElement
      camera.position.set 0, 0, 1

      shaderMaterial = new _3.ShaderMaterial
        vertexShader   : v_my1
        fragmentShader : f_my1
        attributes: {}
        uniforms :
          time : type: 'f',  value: ((new Date()).getTime() % 10000000) * 1.0
          view_cam_fov : type: 'f',  value: view_cam.fov
          view_cam_h   : type: 'f',  value: view_cam.height
          view_cam_w   : type: 'f',  valu8e: view_cam.width
          view_cam_dx  : type: 'f',  value: view_cam.dx
          view_cam_dy  : type: 'f',  value: view_cam.dy
          view_cam_p0  : type: 'v2', value: new _3.Vector2 view_cam.p0.x, view_cam.p0.y
          view_cam_pf  : type: 'v2', value: new _3.Vector2 view_cam.pf.x, view_cam.pf.y
        transparent: false

      # shaderMaterial = new _3.MeshLambertMaterial color: 0x00af00

      # for this sort of scene, we are just dealing with a single rectangle
      # that spans the field of view.  That rectangle gets our shader material
      # It is in the shader where all of the real work is done.

      # just a flat plane that fills the viewport
      geometry = new _3.Geometry()
      geometry.vertices.push new _3.Vector3 view_cam.p0.x, view_cam.p0.y
      geometry.vertices.push new _3.Vector3 view_cam.p0.x, view_cam.pf.y
      geometry.vertices.push new _3.Vector3 view_cam.pf.x, view_cam.pf.y
      geometry.vertices.push new _3.Vector3 view_cam.pf.x, view_cam.p0.y
      geometry.faces.push new _3.Face3 0, 3, 1
      geometry.faces.push new _3.Face3 1, 3, 2

      view_plane = new _3.Mesh geometry, shaderMaterial
      view_plane.position.set 0, 0, 0
      scene.add view_plane

      #cube = new _3.Mesh (new _3.CubeGeometry 1,1,1,1,1,1), shaderMaterial
      #cube.position.set 0, 0, 0
      #scene.add cube



      # add a light
      amb_light = new _3.AmbientLight 0x401010, 1
      scene.add amb_light

      # render loop
      render = () ->
          requestAnimationFrame render
          shaderMaterial.uniforms.time.value = ((new Date()).getTime() % 100000) * 1.0
          renderer.render scene, camera

      renderer.render scene, camera, true
      glut.resize renderer, camera
      render()
