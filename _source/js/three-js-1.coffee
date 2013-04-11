require ['_common'], () ->
  require ['jquery', 'three'], ($, _3) ->

			opt =
				w: window.innerWidth
				h: window.innerHeight
				fov: 75
				near: 0.1
				far: 1000
				cubecount: 30

			# first things first...
			renderer = new _3.WebGLRenderer()

			# create scene and camera
			scene = new _3.Scene()
			camera = new _3.PerspectiveCamera opt.fov,
				opt.w / opt.h, opt.near, opt.far
			renderer.setSize opt.w, opt.h
			document.body.appendChild renderer.domElement
			camera.position.z = 5

			# make some shapes
			shapes = []
			edge = 10 / opt.cubecount
			geometry = new _3.CubeGeometry edge, edge, edge
			material = new _3.MeshLambertMaterial color: 0x00af00
			for i in [0..opt.cubecount]
				cube = new _3.Mesh geometry, material
				cube.position.x = -10 + 20 / opt.cubecount * i
				shapes.push cube
				scene.add cube

			# add a light
			light = new _3.PointLight 0xf0f0f0, 1
			light.position.set 10,10,100
			scene.add light
			amb_light = new _3.AmbientLight 0x404000, 1
			scene.add amb_light

			# render loop
			counter = 0
			render = () ->
				light.position.x = 10 * Math.sin(counter)
				for shape, i in shapes
					shape.rotation.x = 0.2 * counter
					shape.position.y = Math.sin ( counter / 10 + i )
				counter++
				requestAnimationFrame render
				renderer.render scene, camera

			render()
