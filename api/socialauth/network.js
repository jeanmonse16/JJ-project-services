const express = require('express'),
    globalResponse = require('../../network_handlers/response'),
    controller = require('./index')

const router = express.Router()

module.exports = passport => {
    controller.facebookAuth(passport)
    controller.googleAuth(passport)

    router.get('/testfacebook',  passport.authenticate('facebook',{ scope: 'email' }))

    router.get('/testfacebook/callback', passport.authenticate('facebook'), (req, res) => { 
        globalResponse.success(req, res, req.user, 200)
    })

    router.get('/testgoogle', passport.authenticate('google', { scope: 'https://www.google.com/m8/feeds' }) )
    router.get('testgoogle/callback', passport.authenticate('google'), (req, res) => {
        globalResponse.success(req, res, req.user, 200)
    })

    router.post('/facebook', (req, res) => {
        controller.facebookSignIn(req.body.user)
            .then(response => {
                req.session.key = response.key
                globalResponse.success(req, res, response, 200)
            })
            .catch(error => globalResponse.error(req, res, error, 400))
    })

    router.post('/google', (req, res) => {
        controller.googleSignIn(req.body.user)
            .then(response => {
                req.session.key = response.key
                globalResponse.success(req, res, response, 200)
            })
            .catch(error => globalResponse.error(req, res, error, 400))
    })

    return router
}
