const Router = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const noCache = function noCache(req, res, next) {
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	next();
  }

Router.get('/login',noCache,(req,res)=>{
    res.render('auth/login',{fail:req.query.fail,newAcc:req.query.new,bookredirect:req.query.bookredirect});
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
                    address:req.body.address,
                    role:2
                }).save().then(newUser=>{
                    res.redirect('/auth/login?new=true#exampleInputEmail1&bookredirect='+(req.query.bookredirect ));
                })
            });
        }
    })
})



module.exports = Router;