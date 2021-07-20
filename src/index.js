const express= require('express')
require('./db/mongoose.js')    //To connect to database
const taskrouter = require('./routers/task.js')
const userrouter = require('./routers/user.js')
const app = express()


const port= process.env.PORT 

app.use(express.json()) // to get request data in json format
app.use(userrouter)
app.use(taskrouter)

app.listen(port, ()=>{
    console.log("server is running on port "+ port)
})