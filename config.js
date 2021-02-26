require('dotenv').config()

const localDev = {
    api: {
        port: process.env.API_PORT || 3001,
        corsWhitelist: ['https://localhost:3000'],
    },
    mongo: {
        dbUrl: process.env.MONGO_URL || "mongodb://localhost:27017/taskmaster",
        host: process.env.MONGO_SERVICE_HOST || 'localhost',
        port: process.env.MONGO_SERVICE_PORT || 27017
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'ultrasecretoxd'
    },
    mailAuth: {
        email: process.env.EMAIL,
        password: process.env.PASSWORD
    },
    facebookAuth: {
        appID: process.env.FACEBOOK_APP_ID,
        appSecret: process.env.FACEBOOK_APP_SECRET,
        callbackUrl: `http://localhost:${process.env.API_PORT}/users/socialauth/facebook/callback`
    },
    googleAuth: {
        appID: process.env.GOOGLE_APP_ID,
        appSecret: process.env.GOOGLE_APP_SECRET,
        callbackUrl: `http://localhost:${process.env.API_PORT}/users/socialauth/google/callback`
    },
    sessionSecret: process.env.SESSION_SECRET,
    cdn: {
        port: process.env.PORT || 3010,
        host: process.env.HOST || 'http://localhost',
        publicRoute: process.env.PUBLIC_ROUTE || '/public',
        filesRoute: process.env.FILES_ROUTE || 'assets/taskfiles/'
    }
}

const dev = {
    api: {
        port: process.env.API_PORT || 3001,
        corsWhitelist: ['https://jj-project.vercel.app', 'https://jj-project-jvn7dyz1b-monserrateluisje.vercel.app']
    },
    mongo: {
        dbUrl: process.env.MONGO_URL || `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_USER_PASSWORD}@jj-project.n5ac8.mongodb.net/${process.env.MONGO_DB_NAME}?authSource=admin`,
        host: process.env.MONGO_SERVICE_HOST || 'localhost',
        port: process.env.MONGO_SERVICE_PORT || 27017
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'ultrasecretoxd'
    },
    mailAuth: {
        email: process.env.EMAIL,
        password: process.env.PASSWORD
    },
    facebookAuth: {
        appID: process.env.FACEBOOK_APP_ID,
        appSecret: process.env.FACEBOOK_APP_SECRET,
        callbackUrl: `http://localhost:${process.env.API_PORT}/users/socialauth/facebook/callback`
    },
    googleAuth: {
        appID: process.env.GOOGLE_APP_ID,
        appSecret: process.env.GOOGLE_APP_SECRET,
        callbackUrl: `http://localhost:${process.env.API_PORT}/users/socialauth/google/callback`
    },
    sessionSecret: process.env.SESSION_SECRET,
    cdn: {
        port: process.env.PORT || 3010,
        host: process.env.HOST || 'https://festive-heyrovsky-0aafff.netlify.app',
        publicRoute: process.env.PUBLIC_ROUTE || '/.netlify/functions/api/public',
        filesRoute: process.env.FILES_ROUTE || 'assets/taskfiles/'
    }
}

const prod = {}

const env = {
  'local': localDev,
  'dev': dev,
  'prod': prod
}

module.exports = !process.env.MODE 
  ? env['local']
  : env[process.env.MODE]