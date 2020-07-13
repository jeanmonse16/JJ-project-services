const express =  require('express'),
    globalResponse = require('../../network_handlers/response'),
    errorHandler = require('../../network_handlers/errors'),
    controller = require('./index')
    
const router = express.Router()

router.post('/', (req, res) => {
    controller.upsert(req.body.user)
        .then(response => globalResponse.success(req, res, response, 200))
        .catch(error => globalResponse(req, res, error, 502))
})

module.exports = router