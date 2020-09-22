const express = require('express'),
    swaggerUi = require('swagger-ui-express'),
    passport = require('passport'),
    cors = require('cors'),
    config = require('../config'),
    errors = require('../network_handlers/errors'),
    swaggerDoc = require('./swagger.json'),
    db = require('../db'),
    auth = require('./auth/network'),
    app = express()

db(config.localMongo.dbUrl)

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(passport.initialize())

const socialAuth =  require('./socialauth/network')(passport)

app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
app.use('/users/auth', auth)
app.use('/users/socialauth', socialAuth)
app.use('/jwt', (req, res) => {
    res.json({ message: 'holaaa'})
})
app.use(errors)

const serverMessage = () => console.log(`App corriendo en el puerto ${config.api.port}`)

app.listen(config.api.port, serverMessage)