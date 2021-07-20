const mongoose = require('mongoose')
const connectionURL = process.env.MONGO_DB_URL
const databaseName = 'task-manager-api'
mongoose.connect(connectionURL+'/'+databaseName,{useNewUrlParser: true, useCreateIndex: true,useUnifiedTopology: true})







