_ = require 'underscore'
#
# error handling middleware loosely based off of the connect/errorHandler code. This handler chooses
# to render errors using Jade / Express instead of the manual templating used by the connect middleware
# sample.  This may or may not be a good idea :-)
# @param options {object} array of options
#
exports = module.exports = (options) ->
  options = options || {}

  # defaults
  showStack = options.showStack || options.stack
  showMessage = options.showMessage || options.message
  dumpExceptions = options.dumpExceptions || options.dump
  formatUrl = options.formatUrl

  (err, req, res, next) ->

    console.log "Error occurred: " + req.originalUrl
    console.log err
    if dumpExceptions then console.error err.stack

    errData =
      status: err.status
      title: err.title
      message: err.message
      stack: err.stack

    err = _.defaults errData,
      status: 500
      title: 'Unspecified error'

    if err.status == 401
      res.setHeader 'WWW-Authenticate', 'Basic'

    res.statusCode = err.status

    if req.accepts('application/json, json')
      res.setHeader 'Content-Type', 'application/json'
      res.send err
    else
      res.setHeader 'Content-Type', 'text/html'
      res.render 'errors/error', err

        
