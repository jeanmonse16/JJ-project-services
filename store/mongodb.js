const mongoose = require('mongoose')
const schema = mongoose.Schema
const aliasGenerator = require('../')

/* user schema */ 
const userSchema = new schema({
    /*apiUser schema */
    alias: { type: Number, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },
    password: String,
    active: Boolean,
    /* apiuser schema */

    /* facebook schema */
    facebook_id: String,                    
    facebook_fullname: String,
    facebook_picture: String,
    /* facebook schema */

    /*google schema */
    google_id: String,
    google_given_name: String,
    google_fullname: String,
    google_picture: String
    /*google schema */
})

const userModel = mongoose.model('user', userSchema)

const addNewUser = (user, hash) => {
    const newUser = new userModel(user)
    return newUser.save(function (err) {
        if (err) throw new Error(err);
        
        let processedHash = hash.replace(/[/]/g, 'x')
        let hashData = {
            hash: processedHash,
            user_id: newUser._id
        }

        return addAuthHash(hashData)
    })
}

const addNewUserWithSocialMedia = user => {
    const newUser = new userModel(user)
    return newUser.save()
}

/*user schema */

/* auth schema */

const authSchema = new schema({
    email: { type: String, unique: true },
    password: String
})

const authModel = mongoose.model('auth', authSchema)

const addAuthNewUser = (user) => {
    const newAuthUser = new authModel(user)
    return newAuthUser.save()
}

/* auth schema */

/* authHashEmail schema */

const authHashSchema = new schema({
    hash: String,
    user_id: { type: schema.Types.ObjectId, ref: 'User' }
})

const authHashModel = mongoose.model('authHash', authHashSchema)

const addAuthHash = (hashData) => {
    const newAuthHash = new authHashModel(hashData)
    return newAuthHash.save()
}

/* authHashEmail schema */

module.exports = {
    addNewUser,
    addNewUserWithSocialMedia,
    addAuthHash,
    userModel,
    authHashModel
}