define ['three', '_', 'text!../shaders/v/v_my1.glsl'], (_3, _, vshader) ->

    makeCamera = () ->

      #
      # set up the defaults.
      #
      origin = new _3.Vector3 0, 0, -1
      ray    = new _3.Vector3 0, 0, 1
      up     = new _3.Vector3 0, 1, 0

      left      = up.cross(ray).normalize()

      m_fov    = Math.PI / 2

      #
      # each vertex will have an instance of each attribute attached.
      # these values will be interpolated for the benefit of the fragment
      # shaders
      #
      attributes =
        in_ray:     type: 'v3', value: []  # originates from the camera origin
        in_deflect: type: 'v2', value: []  # originates from the center of the screen

      uniforms =
        time : type: 'f', value: null


      #
      # set up the main material for this camera.  the fragment shader is
      # responsible for everything that will appear in the scene.
      #
      shaderMaterial = new _3.ShaderMaterial
        vertexShader   : vshader
        fragmentShader : null
        attributes     : attributes
        uniforms       : uniforms
        transparent    : false

      #
      # build up the scene.  Suprise... It's just a plane.
      #
      scene    = new _3.Scene()

      geometry = new _3.PlaneGeometry 1, 1, 1, 1
      mesh     = new _3.Mesh geometry, shaderMaterial
      mesh.position.set 0, 0, 0
      scene.add mesh

      camera   = new _3.OrthographicCamera -1, 1, -1, 1
      camera.position.set 0, 0, 1


      #
      # if you provide a height and width in pixels, then I can discretize the
      # camera's view and fix up the one underlying geometry to which the material
      # is mapped.  This should be called when the viewport is resized.
      #
      fitToViewport = (w, h) ->

        w_norm = Math.tan m_fov / 2.0
        h_norm = w_norm / w * h

        ray0 = origin.add(ray).
          add(left.multiplyScalar(w_norm / 2.0)).
          add(up.multiplyScalar(h_norm / 2.0))

        #
        # set up our vectors for the shader.  well give both
        # the space vector and a 2d deflection vector
        #
        attributes.in_ray.value[0] = ray0
        attributes.in_ray.value[1] = ray0.add(left.multiplyScalar(-w_norm));
        attributes.in_ray.value[2] = ray0.add(up.multiplyScalar(-h_norm));
        attributes.in_ray.value[3] = ray0.add(ray0.sub(ray).multiplyScalar(2.0))

        # oops... subtract isn't enough, this needs to be v2
        attributes.in_deflect.value[0] = attributes.in_ray.value[0].sub(ray)
        attributes.in_deflect.value[1] = attributes.in_ray.value[1].sub(ray)
        attributes.in_deflect.value[2] = attributes.in_ray.value[2].sub(ray)
        attributes.in_deflect.value[3] = attributes.in_ray.value[3].sub(ray)

        #
        # make the plane perfectly fit our viewport.  This is completely
        # seperate from the logical camera in the scene.  The outside camera
        # is orthogonal, and simply needs to point at our rectangle which is
        # always situated and oriented the same way.
        #
        geometry.vertices[0].set -w / 2, -h / 2, 0
        geometry.vertices[1].set  w / 2, -h / 2, 0
        geometry.vertices[2].set -w / 2,  h / 2, 0
        geometry.vertices[3].set  w / 2,  h / 2, 0

        #
        # fix up the bounds of the camera
        #
        camera.left   = -w / 2
        camera.right  =  w / 2
        camera.top    = -h / 2
        camera.bottom =  h / 2
        camera.updateProjectionMatrix()

        console.log camera


      fov = (nv) ->
        if nv? then return m_fov
        m_fov = nv

      looper = 0

      render = (renderer) ->
        if (looper == 0)
          console.log scene
          console.log camera
          looper += 1
        renderer.render scene, camera

      fov : fov
      origin : origin
      ray    : ray
      up     : up
      render : render
      uniforms : uniforms
      shaderMaterial : shaderMaterial
      fitToViewport  : fitToViewport

    #
    # Hook into the dom events to control the resizing of the
    # main camera
    #
    setup_resize = (renderer) ->
      callback	= () ->
        renderer.setSize window.innerWidth, window.innerHeight
        fitToViewport window.innerWidth, window.innerHeight

      window.addEventListener 'resize', callback, false

      stop	: () -> window.removeEventListener 'resize', callback

    # Make an orthogonal viewplane and set up the rendering within.
    # /everything/ is controlled through the fragment shader
    #
    # @cam holds a description of the camera object.
    #   fov:    field of view in radians.  Default = pi/2
    #   scalex: by default, the horizontal span goes from
    #           along to the edge of each quadrant
    #   near: front clip plane
    #   far: far clip plane
    #   resize: if true, then we'll hook into the window's resize
    #
    # if you pass in w and h, I won't resize the camera when the window size changes
    createWorkspace = () ->

      renderer = new _3.WebGLRenderer()

      internal_cam = makeCamera()
      internal_cam.fov Math.PI / 2

      renderer.setSize  window.innerWidth, window.innerHeight
      internal_cam.fitToViewport window.innerWidth, window.innerHeight
      setup_resize renderer

      ws =
        renderer : renderer
        loop    : () ->
        viewcam : internal_cam
        shader  : (frag_shader) ->
          internal_cam.shaderMaterial.fragmentShader = frag_shader
          internal_cam.shaderMaterial.needsUpdate = true

      anim_loop = () ->
        requestAnimationFrame anim_loop
        internal_cam.uniforms.time.value = ((new Date()).getTime() % 100000) * 1.0
        internal_cam.render renderer
        ws.loop()

      ws.run = () ->
        anim_loop()

      ws

    exports =
        createWorkspace : createWorkspace

