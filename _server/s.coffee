express = require 'express'
less = require 'less'
connect = require 'connect'
nconf = require 'nconf'
auth = require('./middleware/authentication') ajaxLoginUrl : '/api/privateusers/login'

# CONFIGURATION
#
nconf.env().file file: 'settings.json'

# I hate messing with environment variables
development = nconf.get('server:development') || false

# App setup
#
app = express()

if development
  console.log 'DEVELOPMENT MODE IS ON'
  app.locals.pretty = true

app.set 'development', development
app.set 'views', __dirname + '/views'
app.set 'view engine', 'jade'


app.use express.compress()
app.use express.bodyParser()
app.use express.methodOverride()
app.use express.cookieParser()
app.use (req, res, next) ->
  res.removeHeader "x-powered-by"
  next()
# app.use express.session   secret: 'room de la romper'
app.use connect["static"] __dirname + '/public'

app.use '/api/relogin', (req, res, next) ->
  console.log 'give user the chance to reset credentials'
  next
    message: 'Re-login'
    status : 401

# user must be logged in to get to the api
app.use '/api', auth.auth
# user must have specific rights to the fisma path to get to fisma addresses
# app.use '/api/path', auth.pathAccess

app.use app.router

app.use require('./middleware/errorHandler') dumpExceptions: development, showStack: development

# ROUTING
#
require('./routes/home') app

# ...Global Routes - this should be last!
require('./routes/global') app

# RUN
#
port = process.env.PORT || nconf.get("server:standalonePort") || 3000
app.listen port

console.log "Express server listening on port %d in %s mode", port, app.settings.env
