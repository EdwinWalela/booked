const Router = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const saltRounds = 10;

Router.get('/login',(req,res)=>{
    res.render('auth/login',{fail:req.query.fail,newAcc:req.query.new,reset:req.query.reset});
})

Router.post('/register',(req,res)=>{
    
    User.findOne({email:req.body.email}).then(user=>{
        if(!user){
            bcrypt.hash(req.body.password, saltRounds).then(function(hash) {
                new User({
                    name:req.body.name,
                    email:req.body.email,
                    password:hash,
                    mobile:'',
                    address:req.body.address,
                    role:2
                }).save().then(newUser=>{
                    res.redirect('/auth/login?new=true#exampleInputEmail1');
                })
            });
        }
    })
})

Router.get('/verifyaccount',(req,res)=>{
    res.render('auth/verifyaccount',{account:req.query.account});
})
Router.get('/resetpassword',(req,res)=>{
    res.render('auth/resetpassword',{userID:req.query.userID});
    console.log(req.query.userID)
})


module.exports = Router;