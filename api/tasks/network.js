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
        files: req.files || [],
        title: req.body.title,
        description: req.body.description,
        columnName: req.body.columnName,
        state: req.body.state,
        expires_at: req.body.expires_at
    }

    controller.createTask(newTask, req.body.userAlias)
      .then(response => GlobalResponse.success(req, res, response, 200))
      .catch(error => GlobalResponse.error(req, res, error.message, error.code))
})

router.put('/:taskId', secure('profile'), (req, res) => {
    let taskToEdit = {
        id: req.params.taskId,
        title: req.body.title,
        description: req.body.description,
        columnName: req.body.columnName,
        state: req.body.state,
        expires_at: req.body.expires_at,
        files: req.body.files
    }

    controller.updateTask(taskToEdit)
      .then(response => GlobalResponse.success(req, res, response, 200))
      .catch(error => GlobalResponse.error(req, res, error.message, error.code))
})

router.post('/upload', secure('profile'), function (req, res) {
  upload.array('files', 4)(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      GlobalResponse.error(req, res, 'Could not upload the file, multer exception', 500)
      // A Multer error occurred when uploading.
    } else if (err) {
      GlobalResponse.error(req, res, 'Could not upload the file', 500)
      // An unknown error occurred when uploading.
    }
 
    GlobalResponse.success(req, res, 'File or files uploaded', 201)
    // Everything went fine.
  })
})

module.exports = router