const Router = require('express').Router();
const User = require('../models/user');

Router.get('/login',(req,res)=>{
    res.render('auth/login');
})

module.exports = Router;