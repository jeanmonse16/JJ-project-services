module.exports = {
    api: {
        port: process.env.API_PORT || 3001
    },
    localMongo: {
        host: process.env.MONGO_SERVICE_HOST || 'localhost',
        port: process.env.MONGO_SERVICE_PORT || 27017
    }
}