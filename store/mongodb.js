const mongoose = require('mongoose')
const schema = mongoose.Schema
const error = require('../utils/error')

/* user schema */ 
const userSchema = new schema({
    /*apiUser schema */
    alias: { 
        type: Number, 
        unique: true, 
        sparse: true,
        validate: {
            validator: function(v) {
                return String(v).length === 6
            }
        }
    },
    username: { 
        type: String, 
        default: null,
        unique: true
     },
    email: { 
        type: String, 
        unique: true, 
        sparse: true, 
        required: [true, 'An email is required!'],
        validate: {
            validator: function(v) {
                let regex = /^(?:[^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*|"[^\n"]+")@(?:[^<>()[\].,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,63}$/
                return regex.test(v)
            },
            message: props => `${props.value} is not a valid email`
        }
    },
    password: String,
    active: Boolean,
    firstTime: Boolean,
    profile_picture: String,
    /* apiuser schema */

    /* facebook schema */
    facebook_id: String,                    
    facebook_fullname: String,
    /* facebook schema */

    /*google schema */
    google_id: String,
    google_given_name: String,
    google_fullname: String,
    /*google schema */
})

const userModel = mongoose.model('user', userSchema)

const addNewUser = (user, hash) => {
    return new Promise((resolve, reject) => {
        const newUser = new userModel(user)
        newUser.save(function (err) {
            if (err) {
                if (err.errors['alias'])
                    reject('An alias needs 6 digits!')
                else if (err.errors['email'] && ( err.errors['email'].message || err.errors['email'].path || err.errors['email'].kind ))
                    reject(err.errors['email'].message, 500)
                else
                    reject('something went wrong')
            }
            
        
            let processedHash = hash.replace(/[/]/g, 'x')
            let hashData = {
                hash: processedHash,
                user_id: newUser._id
            }

            addAuthHash(hashData)
              .then(() => resolve({}))
              .catch(err => reject(err))
        })
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
    return new Promise ((resolve, reject) => {
        const newAuthHash = new authHashModel(hashData)
        return newAuthHash.save(err => {
            if (err) reject(err)

            resolve({})
        })
    })
}

/* authHashEmail schema */

/* UserTask schema */

const taskSchema = new schema({
    task_id: { type: String, unique: true, sparse: true },
    user_id: { type: schema.Types.ObjectId, ref: 'User' },
    title: String,
    description: String,
    created_at: { type: Date, default: Date.now() },
    last_update: { type: Date, default: Date.now() },
    deleted_at: Date,
    columnName: String,
    state: String,
    expires_at: Date,
    files: [Object]
})

const taskModel = mongoose.model('task', taskSchema)

const columnSchema = new schema({
    name: String,
    tasks: Array,
    tasks_id: { type: String, unique: true, sparse: true },
})

const columnModel = mongoose.model('column', columnSchema)

const taskNotification = new schema({
    task_id: { type: schema.Types.ObjectId, ref: 'Task'  },
    seen: Boolean,
    type: { type: String, ref: 'Tasknotificationtypes' }
})

const taskNotificationModel = mongoose.model('taskNotification', taskNotification)
/* UserTask schema */

module.exports = {
    addNewUser,
    addNewUserWithSocialMedia,
    addAuthHash,
    userModel,
    authHashModel,
    taskModel,
    taskNotificationModel,
    columnModel
}