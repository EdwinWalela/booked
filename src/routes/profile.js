const Router = require('express').Router();

Router.get('/',(req,res)=>{
    res.render('profile');
})

module.exports = Router;