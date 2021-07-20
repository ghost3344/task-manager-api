const mongoose = require('mongoose')
const connectionURL = process.env.MONGO_DB_URL
const databaseName = 'task-manager-api'
mongoose.connect(connectionURL,{useNewUrlParser: true, useCreateIndex: true,useUnifiedTopology: true})







