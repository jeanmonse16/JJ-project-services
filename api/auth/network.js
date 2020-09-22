const express =  require('express'),
    globalResponse = require('../../network_handlers/response'),
    controller = require('./index')
    
const router = express.Router()

router.post('/signup', (req, res) => {
    console.log(req.body.user)
    controller.register(req.body.user)
        .then(response => globalResponse.success(req, res, response, 200))
        .catch(error => globalResponse.error(req, res, error, 400))
})

/* router.put('/verify-account/?hash') */
router.put('/activate-account/:hash', (req, res, next) => {
    console.log(req.params.hash)
    controller.verify(req.params.hash)
        .then(response => globalResponse.success(req, res, response, 200))
        .catch(error => globalResponse.error(req, res, error, 500))
})

router.post('/login', (req, res) => {
    controller.login(req.body.user)
        .then(response => globalResponse.success(req, res, response, 200))
        .catch(error => globalResponse.error(req, res, error, 400))
})

router.get('/resendEmailForActivation/:email', (req, res) => {
    console.log(req.params.email)
    controller.resendEmailForVerification(req.params.email)
        .then(response => globalResponse.success(req, res, response, 200))
        .catch(error => globalResponse.error(req, res, error, 400))
})

router.get('/checkForAccountVerification', (req, res) => {
    if (req.query.email) {
        controller.checkForAccountVerification(req.query.email)
            .then(response => setTimeout( () => globalResponse.success(req, res, response, 200), 2000 ) )
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
    if (req.body.passwords.original === req.body.passwords.copy) {
        controller.updatePassword(req.params.hash, req.body.passwords.original)
            .then(response => globalResponse.success(req, res, response, 200))
            .catch(error => globalResponse.error(req, res, error, 500))
    } else {
        globalResponse.error(req, res, 'The provided passwords do not match', 400)
    }
})

module.exports = router