const { OAuthStrategy, OAuth2Strategy } = require('passport-google-oauth')
const { googleAuth } = require('../config') 

module.exports = (passport, store) => {
    return passport.use(
        new OAuthStrategy(
            {
                consumerKey: googleAuth.appID,
                consumerSecret: googleAuth.appSecret,
                callbackURL: googleAuth.callbackUrl
            },
            async function(token, tokenSecret, profile, done) {
                await store.userModel.findOne(
                    { google_id: profile.id },
                    async (error, user) => {
                        if (error)
                        return done(error)

                        if (user) {
                            let signedUser = jwtAuth.sign({ ...user})      
                            done(null, { token: signedUser, user: user })
                        }

                    else {
                        /*let newUser = {
                            facebook_id: profile.id, // set the users facebook id                 
                            access_token: token, // we will save the token that google provides to the user                    
                            firstName: profile.name.givenName,
                            lastName: profile.name.familyName, // look at the passport user profile to see how names are returned
                            email: profile.emails[0].value// facebook can return multiple emails so we'll take the first
                        }*/

                        await store.addNewUserWithSocialMedia(newUser)
                        done(null, { token: jwtAuth.sign({ ...newUser }), user: newUser })
                    }
                    }
                )
               /* User.findOrCreate({ googleId: profile.id }, function (err, user) {
                  return done(err, user);
                });*/
            }
        )
    )
}