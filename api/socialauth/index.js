const store = require('../../store/mongodb'),
    controller = require('./controller') 

module.exports = controller(store)