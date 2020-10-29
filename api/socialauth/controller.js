const facebookStrategy = require('../../passport_strategies/facebook')
const googleStrategy = require('../../passport_strategies/google')
const jwt = require('../../auth_handlers/index')
const aliasGenerator = require('../../utils/aliasGenerator')

module.exports = store => {
    function facebookAuth(passport) {
        return facebookStrategy(passport, store)
    }

    function googleAuth(passport) {
        return googleStrategy(passport, store)
    }

    function facebookSignIn(user) {
        return new Promise(async (resolve, reject) => {
            let queryUser = await store.userModel.findOne({ facebook_id: user.facebook_id })

            if (!queryUser) {
                const newFacebookUser = await store.userModel({...user, alias: aliasGenerator()})
                newFacebookUser.save((error) => {
                    if (error) { reject('algo salió mal, intentalo de nuevo') }

                    resolve({ feedback: 'Succesful login!', key: jwt.sign({ email: user.facebook_email }) })
                })
            } 
            
            else {
                resolve({ feedback: 'the user exists', key: jwt.sign({ email: user.facebook_email })})
            }
        })
    }

    function googleSignIn(user) {
        return new Promise(async (resolve, reject) => {
            let queryUser = await store.userModel.findOne({ google_id: user.google_id})

            if (!queryUser) {
                const newGoogleUser = await store.userModel({...user, alias: aliasGenerator()})
                newGoogleUser.save((error) => {
                    if (error) { reject('algo salió mal, intentalo de nuevo: ' + error) }

                    resolve({ feedback: 'Succesful login!', key: jwt.sign({ email: user.google_email }) })
                })
            }

            else {
                resolve({ feedback: 'the user exists', key: jwt.sign({ email: user.google_email })})
            }
        })
    }

    return {
        facebookAuth,
        googleAuth,
        facebookSignIn,
        googleSignIn
    }
}