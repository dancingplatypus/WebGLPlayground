module.exports = (app) ->
    # home page
    app.get '/', (req, res) -> res.redirect 'public/index.html'
