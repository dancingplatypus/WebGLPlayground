errorHandler = require('../middleware/errorHandler');

#
# Global routes.  These should be included LAST for wildcard 404 route
# @param app {object} express application object
#
module.exports = (app) ->

    # wildcard route for 404 errors
    app.get '/*', (req, res, next) ->
        console.log req.path
        next
          status: 404
          title: 'Resource not found'
          message: 'Could not resolve ' + req.originalUrl
