const express = require('express'),
    globalResponse = require('../../network_handlers/response'),
    controller = require('./index')

const router = express.Router()

module.exports = passport => {
    controller.facebookAuth(passport)
    controller.googleAuth(passport)

    router.get('/facebook',  passport.authenticate('facebook'))

    router.get('/facebook/callback', passport.authenticate('facebook'), (req, res) => { 
        globalResponse.success(req, res, req.user, 200 )
    })

    router.get('/google', passport.authenticate('google', { scope: 'https://www.google.com/m8/feeds' }) )

    router.get('google/callback', passport.authenticate('google'), (req, res) => {
        globalResponse.success(req, res, req.user, 200)
    })

    return router
}
