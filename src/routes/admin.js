const Router = require('express').Router();
const Book = require('../models/book');
const User = require('../models/user');

Router.post('/book',(req,res)=>{
    let book = req.body;
    Book.findOne({isbn:book.isbn}).then(docs=>{
        if(docs){
					res.status(300).send({err:'duplicate'})
        }else{
            new Book({
                title:book.title,
                author:book.author,
                isbn:book.isbn,
                thumb:'',
                synopsis:book.synopsis,
                price:book.price,
                condition:book.condition,
                cat:book.cat,
                pages:book.pages,
            }).save().then(doc=>{
                res.status(200).send('OK')
            }).catch(err=>{
                res.status(500).send({err:err});
            })
        }
    })
})

Router.post('/user',(req,res)=>{
	new User({
		username:req.body.username,
		cart:[]
	}).save().then(user=>{
		res.status(200).send({msg:'OK'});
	}).catch(err=>{
		res.status(500).send({err:err});
	})
})
module.exports = Router;