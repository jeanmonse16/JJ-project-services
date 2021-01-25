const bcrypt = require('bcryptjs')
const jwtAuth = require('../../auth_handlers')
const mailman = require('../../mailman')
const aliasGenerator = require('../../utils/aliasGenerator')

module.exports = (injectedStore) => {

    function register(user) {
        return new Promise (async (resolve, reject) => {
            if(user.email && user.password) {

                let filter = {
                    email: user.email
                }

                if (user.password.length >= 8) {
                    let mayuscula = false
                    let minuscula = false
                    let numero = false
                    let caracterRaro = false
                    for (let i = 0; i < user.password.length; i++) {
                        if (user.password.charCodeAt(i) >= 65 && user.password.charCodeAt(i) <= 90) {
                            mayuscula = true
                        } else if (user.password.charCodeAt(i) >= 97 && user.password.charCodeAt(i) <= 122) {
                            minuscula = true
                        } else if (user.password.charCodeAt(i) >= 48 && user.password.charCodeAt(i) <= 57) {
                            numero = true
                        } else {
                            caracterRaro = true
                        }
                    }
                    if (!minuscula || !numero) {
                        return reject({ message: 'Not a valid password', code: 400 })
                    }
                }

                const queryData = await injectedStore.userModel.findOne(filter)

                if (!queryData) {
                    
                    const emailHash = await bcrypt.hash(user.email, 5)
                    let newUser = {
                        alias: aliasGenerator(),
                        email: user.email,
                        password: await bcrypt.hash(user.password, 5),
                        active: false,
                        firstTime: true
                    }

                    injectedStore.addNewUser(newUser, emailHash)
                      .then(() => {
                          let link = `https://localhost:3000/activate-account?activation=${emailHash}`
                          let message = `Bienvenido a taskMaster, por favor activa tu cuenta !, activa tu cuenta con el siguiente link`
                          let htmlMessage = `<h1> Bienvenido a taskMaster, por favor activa tu cuenta ! </h1> <p> verifica tu cuenta haciendo click en "Verificar" </p> <br> <a href=${link} > Verificar </a>`
                        
                          mailman(user.email, 'Bienvenido a taskMaster!', message, htmlMessage)
                              .then(() => {
                                  let response = {
                                      feedback: 'usuario creado!, por favor verifica tu email',
                                      email: newUser.email
                                  }
                                  resolve(response)
                            })
                              .catch(e => reject({ message: 'error al enviar correo de verificación', code: 500 }))
                      })
                      .catch(error => reject({ message: error, code: 500 }))
                    

                } else {
                    reject({ message: 'something went wrong!, try again', code: 403 })
                }
            }
            else {
                reject({ message: 'Debes ingresar un email y un password', code: 400 })
            }
        })
    }



    function verify(hash) {
        return new Promise ( async ( resolve, reject ) => {
            let hashFilter = {
                hash: hash
            }

            const hashQuery = await injectedStore.authHashModel.findOne(hashFilter)

            if (hashQuery) {
                const userToActivate = await injectedStore.userModel.findOne({ _id: hashQuery.user_id })
                userToActivate.active = true
                await userToActivate.save()

                await injectedStore.authHashModel.deleteOne({ _id: hashQuery._id })

                let token = jwtAuth.sign({ email: userToActivate.email, alias: userToActivate.alias })
                resolve({ feedback: 'the account has been activated!', key: token })

            } else {
                reject('your account was already verified or something went wrong')
            }

        })
    }



    function login(user) {
        return new Promise ( async (resolve, reject) => {
            let filter = {
                email: user.email
            }
            
            const queryData = await injectedStore.userModel.findOne(filter)

            if (queryData) {
                try {
                    console.log(queryData)
                    if (queryData.google_id || queryData.facebook_id) {
                        reject({ message: 'SOCIAL_SIGN_USER!!!', code: 409 })
                    }

                    else if (queryData.active){
                        bcrypt.compare(user.password, queryData.password)
                          .then(isCorrect => {
                              if (isCorrect) {
                                  resolve({ key: jwtAuth.sign({ email: queryData.email, alias: queryData.alias }) })
                               } else {
                                  reject({message: 'Credenciales inválidas, intentalo de nuevo', code: 404 })
                              }
                          })
                          .catch(e => reject({ message: 'ocurrio un error: ' + e, code: 500 }))
                    } 
                    
                    else {
                        reject({ message: 'the account has not been verified, please verify your account so you can start using our services!', code: 403 })
                    }
    
    
                } catch (error) {
                    reject({ message: error, code: 500 })
                }
            } else {
                reject({ message: 'incorrect credentials', code: 404 })
            }

        })
    }



    function resendEmailForVerification(email) {
        return new Promise ( async (resolve, reject) => {
            if (email){
                try {
                    let query = {
                        email: email
                    }

                    const emailQueryResponse = await injectedStore.userModel.findOne(query)

                    if (!emailQueryResponse) {
                        reject('there is no user related to this email:' + email)
                    }

                    else if (emailQueryResponse.active) {
                        throw new Error('the account was already verified')
                    }

                    else {
                        const emailHash = await injectedStore.authHashModel.findOne({ user_id: emailQueryResponse._id})
                        let link = `https://localhost:3000/activate-account?activation=${emailHash.hash}`
                        let message = `Por favor activa tu cuenta !, activa tu cuenta con el siguiente link`
                        let htmlMessage = `<h1> Por favor activa tu cuenta ! </h1> <p> verifica tu cuenta haciendo click en "Verificar" </p> <br> <a href=${link} > Verificar </a>`
                    
                        mailman(email, 'Recordatorio del team de taskMaster!', message, htmlMessage)
                            .then(() => resolve('Email for account verification sent'))
                            .catch(e => reject('error al enviar correo de verificación'))                                      

                    }

                } catch (error) {
                    reject({ feedback: error.message, code: 400 })
                }
            } else {
                reject({feedback: 'no email was received', code: 400})
            }
        })
    }



    function checkForAccountVerification (email){
        return new Promise ( async (resolve, reject) => {
            const userQuery = await injectedStore.userModel.findOne({ email: email })

            if(!userQuery) reject('something went wrong!')
            else if (userQuery.active) reject('the account was already verified')
            else resolve('the account needs to be verified')
        })
    }



    function sendEmailForPasswordUpdate (email){
        return new Promise ( async ( resolve, reject ) => {
            const userQuery = await injectedStore.userModel.findOne({ email: email })

            if (userQuery) {
                let hash = await bcrypt.hash(email, 5)
                let processedHash = hash.replace(/[/]/g, 'x')
                let hashData = {
                    hash: processedHash,
                    user_id: userQuery._id
                }

                await injectedStore.addAuthHash(hashData)

                let link = `https://localhost:3000/updateYourPassword?update=${processedHash}`
                    let message = `Hola de nuevo, accede a este link para cambiar tu contraseña!`
                    let htmlMessage = `<h1> Hola de nuevo, accede a este link para cambiar tu contraseña!</h1> <p> accede dando click en "Ir"</p> <br> <a href=${link} > Ir </a>`
                    
                    mailman(email, 'Hola de nuevo!', message, htmlMessage)
                        .then(() => {
                            resolve({ feedback: 'the email was sent', email: email })
                        })
                        .catch(e => reject('error al enviar correo de verificación'))
            }

            else {
                reject ('no user found with this email')
            }
        })
    }



    function updatePassword (hash, newPassword){
        return new Promise ( async ( resolve, reject ) => {
            const hashQuery = await injectedStore.authHashModel.findOne({ hash: hash })

            if (hashQuery) {
                const getUserToUpdatePassword = await injectedStore.userModel.findOne({ _id: hashQuery.user_id })
                let bcryptedPassword = await bcrypt.hash(newPassword, 5)
                getUserToUpdatePassword.password = bcryptedPassword
                getUserToUpdatePassword.save()

                await injectedStore.authHashModel.delete({ _id: hashQuery.user_id })

                resolve('you successfully updated the account password!')
            } else {
                reject ('ché, no tienes un key válido para realizar esta operación')
            }
        })
    }


    return {
        register,
        verify,
        login,
        resendEmailForVerification,
        checkForAccountVerification,
        sendEmailForPasswordUpdate,
        updatePassword
    }
}