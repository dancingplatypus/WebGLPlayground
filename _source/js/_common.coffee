requirejs.config

  baseUrl: "/js"

  paths:

  # =====================================
  # THIRD PARTY LIBRARIES

    jquery      : "../3p/jquery-1.9.0"
    jqueryui    : "../3p/jquery-ui-1.10.0"

    three       : "../3p/three"
    glmatrix     : "../3p/glMatrix"
    glut        : "../3p/glut"

    # JSON SCHEMA VALIDATION
    jsv         : "../3p/jsv/jsv"

    # Knockout
    ko          : "../3p/knockout-2.2.1.debug"
    ko_ex       : "../3p/koExt/koExternalTemplateEngine-amd"
    ko_map      : "../3p/knockout.mapping-latest.debug"
    ko_v        : "../3p/knockout.validation"

    ko_v_loader : "blank"

    infuser     : "../3p/infuser-amd"
    trafficCop  : "../3p/TrafficCop"
    prefixfree  : "../3p/prefixfree-1.0.7"
    modernizr   : "../3p/modernizr-2.6.2"

    reqjs_text  : "../3p/requirejs/text"

    _           : "../3p/underscore"
    bootstrap   : "../3p/bootstrap/bootstrap"
    gritter     : "../3p/jquery.gritter"
    jlayout     : "../3p/jlayout/lib/jquery.jlayout"
    contentflow : "../3p/contentflow_src"
    iscroll     : "../3p/iscroll/iscroll"

    # frustratingly enough, aloha contains its own copy of jquery.
    aloha       : "../3p/aloha/lib/aloha-full"

    # Eventually we can use CreateJS, but for now, this is stupid simple
    jstween     : "../3p/jstween-1.1"
    jvectormap  : "../3p/jquery-jvectormap-1.1.1"
    jvm_usa     : "../3p/vectormaps/us_lcc_en"
    jvm_world   : "../3p/vectormaps/world_mill_en"

    # END THIRD PARTY LIBRARIES
    # =====================================

    # =====================================
    # INTERNAL LIBRARIES
    repository   : "_/repository"
    base64       : "_/base64"
    cssmatrix    : "_/cssmatrix"
    piemenu      : "_/jquery.piemenu"
    opentip      : "_/opentip/adapter.jquery"
    opentip_base : "_/opentip/opentip"

    auth         : "_/auth"

    # ...all our cool knockout effects can go here
    ko_handlers  : "_/ko_handlers"
    ko_bootstrap : "_/ko_bootstrap"

    _coverflow   : "_/_coverflow"
    _maps        : "_/_map"
    _breadcrumb  : "_/_breadcrumb"
    _richedit    : "_/_rich-edit"


  shim:
    _          : exports: '_'

    base64     : exports: 'Base64'
    bootstrap  : deps   : ['jquery']
    jqueryui   : deps   : ['jquery', '_']

    infuser    : deps   : ['jquery', 'trafficCop'], exports: 'infuser', init: () ->
      # Initialize infuser so that it will look inside our templates subdirectory
      # for templates that look like <filename>.tmpl.html
      @defaults.templateSuffix = '.tmpl.html'
      @defaults.templateUrl = './views'

    jstween    : deps   : ['jquery'], exports: 'JSTween'

    opentip_base : deps   : ['jquery'], exports: 'Opentip'
    opentip      : deps   : ['opentip_base'], exports: 'Opentip', init: (opentip) ->
        oldSetContent = Opentip.prototype.setContent
        Opentip.prototype.setContent = (content) ->
          if @options? && @options.onRefresh? then @options.onRefresh content
          oldSetContent.call @, content

        opentip.styles.tag =
          borderWidth: 1
          stemLength: 18
          stemBase: 4
          shadow: true
          extends: "dark"
          target: true
          tipJoint: "bottom"
          borderColor: "#317CC5"
          delay: 0

        opentip.styles.tip =
          extends : 'tag'
          target: false
          fixed: false


    jvectormap : deps   : [ 'jqueryui' ], exports: 'jvm'
    jvm_usa    : deps   : [ 'jvectormap' ]
    jvm_world  : deps   : [ 'jvectormap' ]

    three: exports: 'THREE'

    ko: exports: 'ko', init: () ->
      require [ 'ko_ex', 'ko_map' ]
      fix_ko @

    jsv : init: () -> require ['../3p/jsv/json-schema-draft-03']

    '../3p/jlayout/lib/jquery.sizes': deps: [ 'jqueryui' ]
    jlayout:
      deps: ['jqueryui'
        '../3p/jlayout/lib/jquery.sizes'
        '../3p/jlayout/lib/jlayout.border.mod'
        '../3p/jlayout/lib/jlayout.flow'
        '../3p/jlayout/lib/jlayout.grid'
        '../3p/jlayout/lib/jlayout.stack'
        '../3p/jlayout/lib/jlayout.flexgrid'
      ]

    contentflow : deps: [], exports: 'ContentFlow', init: () -> require [
      "../3p/contentflow_addons/ContentFlowAddOn_roundabout"
      "../3p/contentflow_addons/ContentFlowAddOn_stack"
      "../3p/contentflow_addons/ContentFlowAddOn_gallery"
    ]

    # allow programmer to use an observable to initialize a validatedObservable,
    # hijack the function already in ko_v
    #
    ko_v_loader: deps: ['ko', 'ko_v'], init: (ko) ->
      console.log "validation init"
      ko.validation.configure
        registerExtenders: true
        insertMessages: false
        decorateElement: true
        errorElementClass: 'invalid-input'
        parseInputAttributes: true

    gritter: deps: ['jquery'], init: ($) ->
      $.extend $.gritter.options,
        time: 3000
        position: 'custom'


  map:
    '*':
      'knockout' : 'ko'
      'ko_v' : 'ko_v_loader'

    'ko_v_loader':
      'ko_v' : 'ko_v'

#
# provide an easier way to subscribe to array changes in knockout
#
fix_ko = (ko) ->

  ko.observableArray.fn.subscribeArrayChanged = (addCallback, deleteCallback) ->

    previousValue = undefined

    @subscribe (_previousValue) ->
        previousValue = _previousValue.slice 0
      , undefined, 'beforeChange'

    this.subscribe (latestValue) ->
      editScript = ko.utils.compareArrays previousValue, latestValue
      for i in [0..editScript.length-1]
        switch editScript[i].status
          # when "retained" then .... nothing
          when "deleted" then if deleteCallback then deleteCallback editScript[i].value
          when "added"   then if addCallback    then addCallback    editScript[i].value

      previousValue = undefined;

requirejs.onError = (err) ->
    console.log "Err in requirejs: %s", err.message
    console.log err.requireModules
    console.log err
    return

require ['jquery', 'prefixfree', 'modernizr'], ($) ->
  $('.hide-for-prefixfree').removeClass 'hide-for-prefixfree'
  if !console? then windows.console = log : () =>
