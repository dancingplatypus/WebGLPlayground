path = require 'path'

#
# this piece of middleware adds a variable named 'base' to the model
# that always refers to the location of the base uri for the application
#
module.exports = (req, res, next) ->

    app = req.app;

    # set base var
    res.local 'base', '/' == if app.route then '' else app.route

    # override the render method to automatically detect mobile devices
    r1 = res.render
    res.render = (view, model, next) ->
        rd = getRenderData req, view
        model.layout = rd.layout
        r1.call res, rd.view, model, next

    # allow the next piece of middleware to execute
    next()

    #
    # determine which layout and view express should use based on mobile browser detection
    # @param req {request} request from express
    # @param viewName {string} default view to use
    # @returns {object} object with computed layout and view name
    #
    getRenderData = (req, viewName) ->
        isMobile = isMobi req
        layout = if viewName == 'layout' || viewName == 'layout_mobile'
            false
          else
            if isMobile then 'layout_mobile' else 'layout'

        view = viewName
        if isMobile && layout != false
            guess = path.normalize __dirname + '/../views/' + viewName + "_mobile.jade"
            exists = path.existsSync guess
            if exists then view = viewName + "_mobile"

        layout: layout
        view: view
        isMobile: isMobile

    #
    # determine if the current request is coming from a mobile device
    # @req {request} request from express
    # @returns {bool} true if the requesting device is mobile
    #
    isMobi = (req) ->
        ua = req.headers['user-agent'].toLowerCase();
        isMobile = require('./mobileRegex').test ua.substr(0, 4)

