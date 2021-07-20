const express = require('express')
const router = new express.Router()
const Task= require('../models/task.js')
const passwordValidator = require('password-validator');
var schema1 =new passwordValidator()
const auth= require('../middleware/auth.js')

router.get('/tasks',auth,async (req,res)=>{
    try{
        const match= {}
        const sort =[]
        if(req.query.completed)
        {
            match.completed= req.query.completed === 'true' // returns false if req.query.completed is not true and vice versa
            console.log(match.completed)
        }
        if(req.query.sortby)
        {
        const parts = req.query.sortby.split(':') 
 //sort[createdby]  = -1 
        sort[parts[0]] = parts[1] === 'desc'? -1 : 1  // returns -1 if parts[1] is desc and 1 if part1 is asc
            
        }
        await req.user.populate({
            path:'tasks',
            match ,
            options: {
                limit : parseInt(req.query.limit) ,
                skip : parseInt(req.query.skip),
                sort
            }
            }).execPopulate()
        
        res.status(200).send(req.user.tasks)     // virtual task propery of user object
      }
    
    catch(e){
        console.log(e)
        res.status(404).send(e)
    }
})

router.get('/tasks/:id',auth,async (req,res)=>{
    try{
        const task = await Task.findOne({_id: req.params.id,owner: req.user._id})   // can also use User.findOne({_id : req.params.id})
        if(!task)
        {
            res.status(404).send("task not found")
        }
        res.status(200).send(task)
    }
    catch(error){
        res.status(500).send(error)
    }
})

router.post('/tasks',auth,async (req,res)=>  
{   
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try{
        const data = await task.save()  
        res.status(200).send(data)
    }
    catch(error){
    res.status(400).send(error) 
    }
})

router.patch('/tasks/:id',auth,async (req,res)=>  
{   
    const updates = Object.keys(req.body)
    schema1.is().oneOf(['description','completed']);
    const isvalid = updates.every((update=>schema1.validate(update)))
    if(!isvalid){
        res.status(404).send("Invalid Updates") 
    }
    try{
        console.log(req.user)
        const task =await Task.findOne({_id:req.params.id , owner:req.user._id} )  
        if(!task)
        {
            res.status(404).send("task not found")
        }
        updates.forEach((update)=>
        {
            task[update]= req.body[update]
        })
        await task.save()
        res.status(200).send(task)
    }
    catch(error){
    res.status(400).send(error) 
    }
})

router.delete('/tasks/:id',auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner:req.user._id})

        if (!task) {
            res.status(404).send("task not found")
        }

        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router
