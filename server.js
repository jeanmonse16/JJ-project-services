const express = require('express'),
    swaggerUi = require('swagger-ui-express'),
    config = require('./config'),
    errors = require('./network_handlers/errors')

const app = express()
const router = express.Router()

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(router)

app.use('/', (req, res) => {
    console.log(req.body)
    res.send(`te llego el siguiente mensaje:${req.body.message}`)
})

app.listen(config.api.port, () => console.log('App corriendo en el puerto ' + config.api.port))