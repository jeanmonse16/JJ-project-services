exports.success = (req, res, message, status) => {
    let httpStatus = status || 200
    let httpMessage = message || 'null'

    res.status(httpStatus).send({
        error: false,
        status: httpStatus,
        message: httpMessage
    })
}

exports.error = (req, res, message, status) => {
    let httpStatus = status || 500
    let httpMessage = message || 'Internal server error'

    res.status(httpStatus).send({
        error: true,
        status: httpStatus,
        message: httpMessage
    })
}