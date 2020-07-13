const user = require(".")

module.exports = (injectedStore) => {
    async function upsert(user) {
        if(user.username && user.password)
            return injectedStore.addNewUser(user)
        else
            throw new Error('Debes ingresar un username y un password')
    }

    return {
        upsert
    }
}