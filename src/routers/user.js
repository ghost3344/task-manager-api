const express = require('express')
const router = new express.Router()
const User= require('../models/user.js')
var schema1 =new User.passwordValidator()
const auth = require('../middleware/auth.js')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail,cancellationEmail} = require('../emails/accounts')

router.get('/users/me',auth ,async (req,res)=>{
    res.send(req.user)         
})

router.get('/users/me/avatar',auth ,async (req,res)=>{
    
    try{
        const binaryimage = req.user.avatar
        if(!binaryimage)
        {
            throw new Error("this User does not have avatar")
        }
        res.set('Content-Type','image/png')
        res.send(req.user.avatar)
    }
    catch(e)
    {
        res.status(404).send(e)
    }
             
})

router.get('/users/:id',async (req,res)=>{
    try{
        const data = await User.User.findById(req.params.id)   // can also use User.findOne({_id : req.params.id})
        if(!data)
        {
            res.status(404).send("user not found")
        }
        res.status(200).send(data)
    }
    catch(error){
        res.status(500).send(error)
    }
})

router.post('/users',async (req,res)=>  
{   
    const user = new User.User(req.body)
    
    try{
        const data =await user.save()  
        sendwelcomeemail(user.email,user.name)
        const token = await user.generateAuthtoken()
        res.status(200).send({user,token})
    }
    catch(error){
    res.status(400).send(error) 
    }
})

router.post('/users/login',async(req,res)=>{
    const user = await User.User.findUserbyCredentials(req.body.email,req.body.password)
    if(!user){
        res.status(400).send("Unable to login3")
    }
    const token = await user.generateAuthtoken()
    
    res.send({user,token})
})

router.post('/users/logout',auth,async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token!== req.token
        })
        await req.user.save()
        res.send()
    }
    catch(e)
    {
        res.status(500).send(e)
    }
    
})

router.post('/users/logoutall',auth,async(req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }
    catch(e)
    {
        res.status(500).send(e)
    }
    
})


const upload = multer({
    //dest : 'avatars' ,   //  to save image in images folder
    limits: {
        fileSize: 1000000,
    },
    async fileFilter(req,file,cb){
        
            if(!file.originalname.match(/\.(jpg|jpeg|png)/))
            {
                return cb(new Error("Please updoad images only"))
            }
            cb(undefined,true)      
    }
})  // use auth first and then upload in middleware
router.post('/users/me/avatar',auth, upload.single('upload'),async (req,res)=>{
    const buffer =await sharp(req.file.buffer).resize({width:250, hight:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send("profile saved")       
},(error, req,res,next)=>      // to send error received from middleware
{
    res.status(404).send(error.message)
})



router.patch('/users/me',auth,async (req,res)=>  
{       
    const updates = Object.keys(req.body)
    schema1.is().oneOf(['name','password','email','age']);
    const isvalid = schema1.validate(updates)
    if(!isvalid){
        res.status(404).send("Invalid Updates") 
    }
    try{ 
        updates.forEach((update)=>
        {
            req.user[update]= req.body[update]
        })
        await req.user.save()

        res.status(200).send(req.user)
    }
    catch(error){
    res.status(400).send(error) 
    }
})

router.delete('/users/me',auth, async (req, res) => {
    try {
        // const user = await User.User.findByIdAndDelete(req.user._id)

        // if (!user) {
        //     return res.status(404).send()
        // }
        await req.user.remove()
        cancellationEmail(req.user.email,req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/users/me/avatar',auth,async (req,res)=>{
    try{
        console.log(req.user.avatar)
        req.user.avatar = undefined
        await req.user.save()
        res.send(req.user)
    }
    catch(e)
    {
        res.status(500).send(e)
    }
})

module.exports = router