const jwt = require('jsonwebtoken')
const User = require('../models/user.js')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JSON_WEB_TOKEN_SECRET)
        const user = await User.User.findOne({ _id: decoded._id, 'tokens.token': token })
        
        if (!user) {
            throw new Error()
        }
        req.user = user
        req.token = token
        next()
    } catch (e) {       
        res.status(401).send("authentication failed") 
    }
}

module.exports = auth