const express = require('express'),
    globalResponse = require('../../network_handlers/response'),
    controller = require('./index')

const router = express.Router()

module.exports = passport => {
    controller.facebookAuth(passport)
    controller.googleAuth(passport)

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
