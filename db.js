const db = require("mongoose")

db.Promise = global.Promise

async function connect(url){
    //la conexión a la base de datos cloud se resolvera con las promesas nativas de nodejs, en caso de dar error nos lo arrojara
  db.connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  })
    .then(() => console.log("[db]: database connected"))
    .catch(e => console.log(e))
}

module.exports = connect