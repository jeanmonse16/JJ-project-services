const jwt = require('jsonwebtoken'),
    config = require('../config'),
    error = require('../network_handlers/errors')

const secret = config.jwt.secret

const sign = data => jwt.sign(data, secret)

const check = {
    own: (req, owner) => {
        const decoded = decodeHeader(req)
        console.log(decoded)
        if(decoded.id !== owner){
            throw error('fuck you, put a goddamn good password', 404)
        }
    },
    logged: (req) => {
        const decoded = decodeHeader(req)
    }
}

function getToken(bearer){
    if(!bearer){
        throw new Error('no vinó ningun token')
    }
    if(bearer.indexOf('Bearer ') === -1){
        throw new Error('formato de token invalido')
    }
    let token = bearer.replace('Bearer ', '')
    return token
}

function decodeHeader(req){
    const authorization = req.headers.authorization || ''
    const token = getToken(authorization)
    const decoded = verify(token)
    req.body.user = decoded
    return decoded
}

module.exports = {
    sign,
    check
}