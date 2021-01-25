const express = require('express')

const app = express()

app.use('/files', express.static('/public'))

app.listen(3010, () => `holaa`)