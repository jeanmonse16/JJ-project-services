const router = require('express').Router()
const multer = require('multer')
const secure = require('./secure')
const GlobalResponse = require('../../network_handlers/response')
const controller = require('./index')
const config = require('../../config')
const s3 = require('../../network_handlers/s3')()

const filesStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `public/assets/taskfiles/`)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const uploadFile = s3.uploadFile()
const upload = multer({ storage: filesStorage })

router.get('/updateSessionKey', secure('profile'), (req, res) => {
    controller.updateSessionKey(req.body)
      .then(response => GlobalResponse.success(req, res, response, 200))
      .catch(error => GlobalResponse.error(req, res, error.message, error.code)) 
})

router.get('/profile', secure('profile'), (req, res) => {
    controller.getUserProfile(req.body.userEmail)
      .then(response => GlobalResponse.success(req, res, response, 200) )
      .catch(error => GlobalResponse.error(req, res, error.message, error.code))
})

router.put('/updateUserNotifications', secure('profile'), (req, res) => {
    controller.getUserProfile(req)
      .then(response => GlobalResponse.success(req, res, response, 200))
      .catch(error => GlobalResponse.error(req, res, error, 500)) 
})

router.put(
  '/updateUser', 
  secure('profile'),
  //upload.single('file'), 
  uploadFile.single('file'),
  (req, res) => {
      let userUpdate = {
        alias: req.body.alias,
        profileImage: req.file || req.body.profileImage,
        username: req.body.username || null,
        email: req.body.email || null,
        currentPassword: req.body.currentPassword || null,
        newPassword: req.body.newPassword || null
      }

      controller.updateUser(userUpdate)
          .then(response => GlobalResponse.success(req, res, response, 201))
          .catch(error => GlobalResponse.error(req, res, error.message, error.code)) 
})

router.put('/endUserFirstTime/:alias', secure('update'), (req, res) => {
    controller.endUserFirstTime(req.params.alias)
      .then(response => GlobalResponse.success(req, res, response, 200))
      .catch(error => GlobalResponse.error(req, res, error, 500))
})

module.exports = router