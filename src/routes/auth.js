const Router = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const saltRounds = 10;



Router.get('/login',(req,res)=>{
    res.render('auth/login',{fail:req.query.fail,newAcc:req.query.new});
})

Router.post('/register',(req,res)=>{
    User.findOne({email:req.body.email}).then(user=>{
        if(!user){
            bcrypt.hash(req.body.password, saltRounds).then(function(hash) {
                new User({
                    name:req.body.name,
                    email:req.body.email,
                    password:hash,
                    mobile:req.body.mobile,
                    address:req.body.address
                }).save().then(newUser=>{
                    res.redirect('/auth/login?new=true#exampleInputEmail1');
                })
            });
        }
    })
})



module.exports = Router;