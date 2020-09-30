const { Strategy: FacebookStrategy } = require('passport-facebook'),
    { facebookAuth } = require('../config'),
    jwtAuth = require('../auth_handlers/index')

module.exports = (passport, store) => {
    passport.use(
        'facebook',
        new FacebookStrategy({
            clientID: facebookAuth.appID,
            clientSecret: facebookAuth.appSecret,
            callbackURL: facebookAuth.callbackUrl
        }, async function( access_token, refresh_token, profile, done ) {
            console.log(profile)
            await store.userModel.findOne(
                { 'facebook_id': profile.id }, 
                async (error, user) => {
                    if (error)
                        return done(error)

                    if (user) {
                        let signedUser = jwtAuth.sign({ ...user})      
                        done(null, { token: signedUser, user: user })
                    }

                    else {
                        let newUser = {
                            facebook_id: profile.id, // set the users facebook id                 
                            access_token: access_token, // we will save the token that facebook provides to the user                    
                            firstName: profile.name.givenName,
                            lastName: profile.name.familyName, // look at the passport user profile to see how names are returned
                            email: profile.emails[0].value// facebook can return multiple emails so we'll take the first
                        }

                        await store.addNewUserWithSocialMedia(newUser)
                        done(null, { token: jwtAuth.sign({ ...newUser }), user: newUser })
                    }
                })
        })
    )

    return passport
}