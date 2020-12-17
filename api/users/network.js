const router = require('express').Router()
const GlobalResponse = require('../../network_handlers/response')
const secure = require('./secure')
const controller = require('./index')

router.get('/profile', secure('profile'), (req, res) => {
    controller.getUserProfile(req.body.userEmail)
      .then(response => GlobalResponse.success(req, res, response, 200))
      .catch(error => GlobalResponse.error(req, res, error, 500))
})

router.put('/updateUserNotifications', secure('profile'), (req, res) => {
    controller.getUserProfile(req)
      .then(response => GlobalResponse.success(req, res, response, 200))
      .catch(error => GlobalResponse.error(req, res, error, 500))
})

router.put('/endUserFirstTime/:alias', secure('update'), (req, res) => {
    controller.endUserFirstTime(req.body)
      .then(response => GlobalResponse.success(req, res, response, 200))
      .catch(error => GlobalResponse.error(req, res, error, 500))
})

module.exports = router