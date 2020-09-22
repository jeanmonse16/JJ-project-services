const facebookStrategy = require('../../passport_strategies/facebook')
const googleStrategy = require('../../passport_strategies/google')

module.exports = store => {
    function facebookAuth(passport) {
        return facebookStrategy(passport, store)
    }

    function googleAuth(passport) {
        return googleStrategy(passport, store)
    }

    return {
        facebookAuth,
        googleAuth
    }
}