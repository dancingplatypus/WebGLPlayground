require ['../_common'], () ->
  require ['jquery', 'three'], ($, _3) ->

    $ () ->
      container = document.getElementById 'container'
      renderer = new _3.WebGLRenderer()
      renderer.setSize container.offsetWidth, container.offsetHeight
      container.appendChild renderer.domElement

      scene = new _3.Scene()

      camera = new _3.PerspectiveCamera 45, container.offsetWidth / container.offsetHeight, 1, 4000
      camera.position.set 0, 0, 3.3333
      scene.add camera

      geometry = new _3.PlaneGeometry 1, 1
      mesh = new _3.Mesh geometry, new _3.MeshBasicMaterial()
      scene.add mesh

      renderer.render scene, camera
