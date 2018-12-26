const express = require('express');
const mongoose =require('mongoose');
const Book = require('./models/book');
const User =require('./models/user');
const adminRoutes =require('./routes/admin');

const app = express();

mongoose.connect(process.env.DB_URI,{useNewUrlParser:true},()=>{
    console.log('connected to db')
})
app.listen(process.env.PORT,()=>{
    console.log(`listening to requests on port ${process.env.PORT}`);
})

app.set('view engine', 'ejs');
app.use('/assets',express.static('assets'));
app.use(express.urlencoded({extended:false}));
app.use('/admin',adminRoutes);


app.get('/',(req,res)=>{
    res.render('index');
})

app.get('/search',(req,res)=>{
	let queryString = req.query.q;
    if(queryString){
			Book.find({name:queryString}).limit(6).then((books)=>{
				res.render('search',{books:books});
			})
    }else{
        Book.find({}).limit(6).then((books)=>{
        	res.render('search',{books:books});
        })
    }
    
})

app.get('/cat/:catname',(req,res)=>{
	Book.find({}).then(books=>{
		res.render('search',{books:books})
	});
})

app.get('/book/:id',(req,res)=>{
		Book.findById(req.params.id).then(book=>{
			res.render('book',{book:book})
		});
})

app.get('/cart',(req,res)=>{
	User.findById('5c23dddc2e735f025cc4cef3').then(user=>{
		Book.find({
			'_id': { $in: user.cart}
		}).then(books=>{
			res.render('cart',{books:books})
		})
	})
})

app.post('/cart',(req,res)=>{
	User.update(
		{ _id: '5c23dddc2e735f025cc4cef3' }, 
		{ $push: { cart: req.body.item } },
	).then(doc=>{
		res.send('OK')
	})
})
app.delete('/cart/:id',(req,res)=>{
	User.update(
    { _id: '5c23dddc2e735f025cc4cef3' }, 
    { $pull: { cart: { $in: req.params.id }} }
	).then(doc=>{
		res.send('OK')
	})
})