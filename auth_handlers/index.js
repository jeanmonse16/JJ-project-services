const jwt = require('jsonwebtoken'),
    config = require('../config'),
    error = require('../utils/error')

const secret = config.jwt.secret

const sign = data => jwt.sign(data, secret, {
    expiresIn: '10min'
})

function verify(token){
    return jwt.verify(token, secret, (err, decoded) => {
        if (err && err.message === 'jwt expired') {
            throw error('Expired Token', 401)
        }
        else if (err && err.message === 'jwt malformed') {
            throw error('Invalid token', 401)
        }
        else {
            return decoded
        }
    })
}

const check = {
    own: (req, owner) => {
        const decoded = decodeHeader(req)
        console.log(decoded)
        if(decoded.alias !== owner){
            throw error('you cannot hace access to this resource', 401)
        }

        req.body.userEmail = decoded.email
        req.body.alias = decoded.alias
    },
    logged: (req) => {
        const decoded = decodeHeader(req)
        console.log(decoded)
        if(!decoded.email) {
            throw error('No puedes acceder a este recurso', 401)
        }

        req.body.userEmail = decoded.email
        req.body.alias = decoded.alias
    }
}

function getToken(bearer){
    if(!bearer){
        throw error('no vinó ningun token')
    }
    if(bearer.indexOf('Bearer ') === -1){
        throw error('formato de token invalido')
    }
    let token = bearer.replace('Bearer ', '')
    return token
}

function decodeHeader(req){
    const authorization = req.headers.authorization || ''
    const token = getToken(authorization)
    const decoded = verify(token)
    return decoded
}

module.exports = {
    sign,
    check
}