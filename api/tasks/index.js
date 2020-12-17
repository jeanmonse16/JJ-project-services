const store = require('../../store/mongodb')
const controller = require('./controller')

module.exports = controller(store)