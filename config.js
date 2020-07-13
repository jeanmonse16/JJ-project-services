module.exports = {
    api: {
        port: process.env.API_PORT || 3001
    },
    localMongo: {
        dbUrl: process.env.MONGO_URL || "mongodb://localhost:27017/jj-project",
        host: process.env.MONGO_SERVICE_HOST || 'localhost',
        port: process.env.MONGO_SERVICE_PORT || 27017
    }
}