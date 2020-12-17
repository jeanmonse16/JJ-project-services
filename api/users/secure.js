const auth = require('../../auth_handlers')

module.exports = function checkAuth(action) {

    function middleware (req, res, next){
        switch(action){
            case'profile':
                auth.check.logged(req)
                next()
            break
            case 'update':
                let owner = req.params.alias
                auth.check.own(req, owner)
                next()
            break
            case 'follow':
                auth.check.logged(req)
                next()
            break
            default:
                next()
        }
    }
    return middleware
}