const express = require('express'),
    session = require('express-session'),
    swaggerUi = require('swagger-ui-express'),
    passport = require('passport'),
    cors = require('cors'),
    config = require('../config'),
    errors = require('../network_handlers/errors'),
    swaggerDoc = require('./swagger.json'),
    db = require('../db'),
    auth = require('./auth/network'),
    app = express(),
    https = require('https'),
    fs = require('fs'),
    MongoStore = require('connect-mongo')(session)

db(config.localMongo.dbUrl)

app.use(
  cors({
    origin: 'https://localhost:3000',
    optionsSuccessStatus: 200,
    credentials: true
  })
)

console.log(Math.round(Math.random()*999999))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(passport.initialize())
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: config.sessionSecret,
    cookie: { expires: new Date( Date.now() + 600000 ) },
    store: new MongoStore({
      url: config.localMongo.dbUrl,
      autoReconnect: true
    })
  })
)

/*app.use(function(req, res, next) {
  res.header('Content-Type', 'application/json;charset=UTF-8')
  res.header('Access-Control-Allow-Credentials', true)
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})*/

const socialAuth =  require('./socialauth/network')(passport)

app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
app.use('/users/auth', auth)
app.use('/users/socialauth', socialAuth)
app.use('/jwt', (req, res) => {
    res.json({ message: 'holaaa'})
})

app.get("/cookies", (req, res) => {
  req.session.count = req.session.count ? req.session.count + 1 : 1
  req.session.data = 'jean'
  res.cookie('jwt', '200').status(200).json({ hello: "world", counter: req.session.count, session: req.session.cookie })
})

app.use(errors)

const serverMessage = () => console.log(`App corriendo en el puerto ${config.api.port}`)

 /*para correrlo con https falso
https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}, app).listen(config.api.port, serverMessage) */
  
app.listen(config.api.port, serverMessage)