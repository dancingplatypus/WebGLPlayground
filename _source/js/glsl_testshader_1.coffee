require ['_common'], () ->
  require ['jquery', 'three',
    'text!../shaders/v/v_test1.glsl'
    'text!../shaders/f/test1.glsl'
    ],
    ($, _3, v_shade, f_shade) ->

      console.log "v_test1.glsl"
      console.log v_shade
      console.log "test1.glsl"
      console.log f_shade

      opt =
        w: window.innerWidth
        h: window.innerHeight
        fov: 75
        near: 0.1
        far: 1000
        cubecount: 1

      # first things first...
      renderer = new _3.WebGLRenderer()

      # create scene and camera
      scene = new _3.Scene()
      camera = new _3.PerspectiveCamera opt.fov,
        opt.w / opt.h, opt.near, opt.far
      renderer.setSize opt.w, opt.h
      document.body.appendChild renderer.domElement
      camera.position.z = 500

      # boss material
      uniforms =
        delta: type: 'f', value :0.0
        scale: type: 'f', value :1.0
        alpha: type: 'f', value :1.0

      shaderMaterial = new _3.ShaderMaterial
        vertexShader   : v_shade
        fragmentShader : f_shade
        attributes: {}
        uniforms : uniforms
        transparent: true

      # make some shapes
      shapes = []
      edge = 10 / opt.cubecount
      geometry = new _3.SphereGeometry 60, 10, 10
      material = new _3.MeshLambertMaterial color: 0x00af00
      material = shaderMaterial

      for i in [0..opt.cubecount]
        cube = new _3.Mesh geometry, material
        cube.position.x = -10 + 20 / opt.cubecount * i
        shapes.push cube
        scene.add cube

      # add a light
      light = new _3.PointLight 0xf0f0f0, 1
      light.position.set 10,10,100
      scene.add light

      amb_light = new _3.AmbientLight 0x402020
      scene.add amb_light

      # render loop
      render = () ->
        uniforms.delta.value += 0.1
        requestAnimationFrame render
        renderer.render scene, camera

      render()

