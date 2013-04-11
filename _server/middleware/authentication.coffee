passwordHash = require 'password-hash'
mongo = require 'mongoskin'
nconf = require 'nconf'
_ = require 'underscore'

hasRole = (role, callback) ->
  callback null, -1 != _.indexOf @user.groups, role

pathId = ///
  [/\\]([^/\\]+)
///


# make sure that basic authentication is set in the header
module.exports =
  (options) ->
    hasRole: (roles) ->

      if !roles.isArray()
        roles = [ roles ]

      (req, res, next) ->
        found = _.find roles, (rolename) -> req.user.hasRole rolename
        if found? next() else next
          status: 403
          title: 'Insufficient privilege'
          message: 'Unable to access ' + req.originalUrl

    # this will
    pathAccess: (req, res, next) ->
      console.log 'path access check'
      hasAccess = true
      if req.user? && -1 == _.indexOf req.user.groups, 'root'
        console.log 'not root - check rights'
        # not root, check the rights
        path = pathId.exec(req.url)[1]
        console.log "PATH TO ACCESS = " + path
        db = mongo.db nconf.get("server:mongoUri"), journal: true
        db.collection('rights').findOne user: req.user.id, (err, rights) ->
          if err? || rights == null
            hasAccess = false
          else
            access = rights.paths[path]
            if !(access && access.read && (req.method == 'get') || access.write)
                hasAccess = false

          next if hasAccess then null else
            status: 403
            title: 'AuthenticationFailed'
            message: 'Could not access ' + req.originalUrl


    auth: (req, res, next) ->

      header   = req.headers['authorization'] || ''
      token    = header.split(/\s+/).pop() || ''
      auth     = new Buffer(token, 'base64').toString()
      parts    = auth.split /:/
      username = parts[0]
      password = parts[1]

      # root password can be set in the configuration
      if (username == 'root')
        rootpassword = nconf.get 'server:overrideRootPassword'
        if rootpassword? && password == rootpassword
          req.user =
            name: 'root'
            groups: ['root']
          req.hasRole = hasRole
          next()
          return

      db = mongo.db nconf.get("server:mongoUri"), journal: true
      db.collection('privateusers').findOne name: username, (err, user) ->
        if err then next err
        if !user || !user.password == passwordHash.generate password
          if options.ajaxLoginUrl? && req.originalUrl.indexOf(options.ajaxLoginUrl) != -1
            next
              message: 'Incorrect login information'
              status : 403
          else
            next
              message: 'Incorrect login information'
              status : 401
        else
          req.user =
            id : user._id
            name: user.name
            groups: user.groups
          req.hasRole = hasRole
          next()

      return
