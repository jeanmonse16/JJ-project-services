const mongoose = require('mongoose')
const schema = mongoose.Schema

const userSchema = new schema({
    username: String,
    password: String
})

const userModel = mongoose.model('user', userSchema)

const addNewUser = (user) => {
    const newUser = new userModel(user)
    return newUser.save()
}

module.exports = {
    addNewUser
}