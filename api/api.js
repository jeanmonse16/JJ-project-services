const express = require('express'),
    serverless = require('serverless-http'),
    session = require('express-session'),
    swaggerUi = require('swagger-ui-express'),
    passport = require('passport'),
    cors = require('cors'),
    config = require('../config'),
    errors = require('../network_handlers/errors'),
    swaggerDoc = require('./swagger.json'),
    db = require('../db'),
    auth = require('./auth/network'),
    users = require('./users/network'),
    tasks = require('./tasks/network')
    app = express(),
    https = require('https'),
    fs = require('fs'),
    path = require('path')
    MongoStore = require('connect-mongo')(session),
    AWS = require("aws-sdk")

db(config.mongo.dbUrl)

//const credentials = new AWS.SharedIniFileCredentials({profile: 'personal-account'})
// const credentials = {
//   expired: false,
//   expireTime: null,
//   refreshCallbacks: [],
//   accessKeyId: config.aws.accessKeyId,
//   sessionToken: undefined,
//   filename: undefined,
//   profile: config.aws.profile,
//   disableAssumeRole: false,
//   preferStaticCredentials: false,
//   tokenCodeFn: null,
//   httpOptions: null
// }
// AWS.config.credentials = credentials
// console.log(AWS.config.credentials.accessKeyId, AWS.config.credentials)
// AWS.config.getCredentials(function(err) {
//   if (err) console.log(err.stack);
//   // credentials not loaded
//   else {
//     console.log("Access key:", AWS.config.credentials.accessKeyId);
//   }
// });
// s3 = new AWS.S3({
//   apiVersion: '2006-03-01',
// });

// Call S3 to list the buckets
// s3.listBuckets(function(err, data) {
//   if (err) {
//     console.log("Error", err);
//   } else {
//     console.log("Success", data.Buckets);
//   }
// });

const corsOptions = {
  origin: function (origin, callback) {
    //para trabajar con postman
    // if (origin === undefined)
    //   callback(null, true)
    if (config.api.corsWhitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  optionsSuccessStatus: 200,
  credentials: true
}

app.use( cors(corsOptions) )

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
      url: config.mongo.dbUrl,
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

/*app.get("/cookies", (req, res) => {
  req.session.count = req.session.count ? req.session.count + 1 : 1
  req.session.data = 'jean'
  res.cookie('jwt', '200').status(200).json({ hello: "world", counter: req.session.count, session: req.session.cookie })
})*/

app.use(errors)

const serverMessage = () => console.log(`App corriendo en el puerto ${config.api.port}`)

if (!process.env.MODE) {
  app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
  app.use('/users/auth', auth)
  app.use('/users/socialauth', socialAuth)
  app.use('/users/tasks', tasks)
  app.use('/users', users)
  app.use(config.cdn.publicRoute, express.static(path.join(process.cwd() + '/public')))
  app.use('/taskfiles', express.static(path.join(process.cwd() + '/public/assets/taskfiles')))
  app.listen(config.api.port, serverMessage)
}

else {
  app.use('/.netlify/functions/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
  app.use('/.netlify/functions/api/users/auth', auth)
  app.use('/.netlify/functions/api/users/socialauth', socialAuth)
  app.use('/.netlify/functions/api/users/tasks', tasks)
  app.use('/.netlify/functions/api/users', users)
  app.use(config.cdn.publicRoute, express.static(path.join(process.cwd() + '/public')))
  app.use('/taskfiles', express.static(path.join(process.cwd() + '/public/assets/taskfiles')))
}

module.exports.handler = serverless(app)

 /*para correrlo con https falso
https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}, app).listen(config.api.port, serverMessage) */