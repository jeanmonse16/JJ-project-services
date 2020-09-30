require('dotenv').config()

module.exports = {
    api: {
        port: process.env.API_PORT || 3001
    },
    localMongo: {
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
    sessionSecret: process.env.SESSION_SECRET
}