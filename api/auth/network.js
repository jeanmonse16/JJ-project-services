const express =  require('express'),
    globalResponse = require('../../network_handlers/response'),
    controller = require('./index')
    
const router = express.Router()

router.post('/signup', (req, res) => {
    controller.register(req.body.user)
        .then(response => globalResponse.success(req, res, response, 200))
        .catch(error => globalResponse.error(req, res, error.message, error.code))
})

router.put('/activate-account/:hash', (req, res, next) => {
    controller.verify(req.params.hash)
        .then(response => {
            req.session.key = response.key
            globalResponse.success(req, res, response, 200)
        })
        .catch(error => globalResponse.error(req, res, error, 500))
})

router.post('/login', (req, res) => {
    controller.login(req.body.user)
        .then(response => {
            req.session.key = response
            globalResponse.success(req, res, response, 200)
        })
        .catch(error => globalResponse.error(req, res, error.message, error.code))
})

router.get('/login', (req, res) => {
    res.json({ 'message': 'hola' })
    res.end()
})

router.get('/resendEmailForActivation/:email', (req, res) => {
    controller.resendEmailForVerification(req.params.email)
        .then(response => globalResponse.success(req, res, response, 200))
        .catch(error => globalResponse.error(req, res, error, 400))
})

router.get('/checkForAccountVerification', (req, res) => {
    if (req.query.email) {
        controller.checkForAccountVerification(req.query.email)
            .then(response => globalResponse.success(req, res, response, 200) )
            .catch(error => globalResponse.error(req, res, error, 400))
    } else {
        globalResponse.error(req, res, 'No email attached', 400)
    }
})

router.post('/sendEmailForPasswordUpdate', (req, res) => {
    controller.sendEmailForPasswordUpdate(req.body.email)
        .then(response => globalResponse.success(req, res, response, 200))
        .catch(error => globalResponse.error(req, res, error, 500))
})

router.put('/updatePassword/:hash', (req, res) => {
    if (req.body.original === req.body.copy) {
        controller.updatePassword(req.params.hash, req.body.original)
            .then(response => globalResponse.success(req, res, response, 200))
            .catch(error => globalResponse.error(req, res, error, 500))
    } else {
        globalResponse.error(req, res, 'The provided passwords do not match', 400)
    }
})

module.exports = router