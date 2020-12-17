const router = require('express').Router()
const multer = require('multer')
const controller = require('./index')
const secure = require('../users/secure')
const GlobalResponse = require('../../network_handlers/response')

const filesStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/assets/taskfiles/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})

const upload = multer({ storage: filesStorage })

router.post('/', secure('profile'), upload.array('files', 4), (req, res) => {

    let newTask = {
        files: req.files,
        title: req.body.title,
        description: req.body.description,
        taskColumn: req.body.taskColumn,
        state: req.body.state
    }
    console.log('punto de control', req.files)

    controller.createTask(newTask, req.body.user_id)
      .then(response => GlobalResponse.success(req, res, response, 200))
      .catch(error => GlobalResponse.error(req, res, error, 500))
})

module.exports = router