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
                const newFacebookUserAlias = aliasGenerator()
                const newFacebookUser = await store.userModel({...user, alias: newFacebookUserAlias, firstTime: true})
                newFacebookUser.save((error) => {
                    if (error) { reject('algo salió mal, intentalo de nuevo') }

                    resolve({ feedback: 'Succesful login!', key: jwt.sign({ email: user.email, alias: newFacebookUserAlias }) })
                })
            } 
            
            else {
                resolve({ feedback: 'the user exists', key: jwt.sign({ email: user.email, alias: queryUser.alias })})
            }
        })
    }

    function googleSignIn(user) {
        return new Promise(async (resolve, reject) => {
            let queryUser = await store.userModel.findOne({ google_id: user.google_id})

            if (!queryUser) {
                const newGoogleUserAlias = aliasGenerator()
                const newGoogleUser = await store.userModel({...user, alias: newGoogleUserAlias, firstTime: true })
                newGoogleUser.save((error) => {
                    if (error) { reject('algo salió mal, intentalo de nuevo: ' + error) }

                    resolve({ feedback: 'Succesful login!', key: jwt.sign({ email: user.email, alias: newGoogleUserAlias }) })
                })
            }

            else {
                resolve({ feedback: 'the user exists', key: jwt.sign({ email: user.email, alias: queryUser.alias })})
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