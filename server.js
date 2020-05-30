const express = require('express')

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.listen(3001, () => console.log('App corriendo en el puerto 3001'))