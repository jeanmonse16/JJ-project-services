const express = require('express'),
    swaggerUi = require('swagger-ui-express'),
    config = require('../config'),
    errors = require('../network_handlers/errors'),
    swaggerDoc = require('./swagger.json'),
    db = require('../db'),
    user = require('./user/network')

const app = express()


db(config.localMongo.dbUrl)

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDoc))

/*app.use('/api', (req, res) => {
    console.log(req.body)
    res.send(`te llego el siguiente mensaje:${req.body.message}`)
})*/

app.use('/api/user', user)
app.use(errors)

app.listen(config.api.port, () => console.log('App corriendo en el puerto ' + config.api.port))