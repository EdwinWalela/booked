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
	if(true){
		User.findById('5c23dddc2e735f025cc4cef3').then(user=>{
			res.render('index',{user:user});
		})
	}else{
		res.render('index',{user:false})
	}
})

app.get('/search',(req,res)=>{
	if(true){
		let filter = req.query.filter;
		let sort = {};
		if(filter === 'price'){
			sort = {
				price:1
			};
		}else if(filter === 'condition'){
			sort = {
				condition:1
			};
		}

		User.findById('5c23dddc2e735f025cc4cef3').then(user=>{
			let queryString = req.query.q;
			if(queryString){
					Book.find({name:queryString})
					.limit(6)
					.sort(sort)
					.then((books)=>{
						res.render('search',{
							user:user,
							books:books
						});
					})
			}else{
				Book.find({}).limit(60).then((books)=>{
					res.render('search',{
						books:books,
						user:user
					});
				})
			}
		})
	}else{
		// not logged in
	}
})


app.get('/cat/:catname',(req,res)=>{
	if(true){
		User.findById('5c23dddc2e735f025cc4cef3').then(user=>{
				Book.find({}).limit(6).then((books)=>{
					res.render('search',{
						books:books,
						user:user
					});
				})
			});
	}else{
		// not logged in
	}
})

app.get('/book/:id',(req,res)=>{
	if(true){
		User.findById('5c23dddc2e735f025cc4cef3').then(user=>{
			Book.findById(req.params.id).then(book=>{
				res.render('book',{
					book:book,
					user:user
				});
			})
		});
	}else{
		// not logged in
	}
})

app.get('/cart',(req,res)=>{
	User.findById('5c23dddc2e735f025cc4cef3').then(user=>{
		Book.find({
			'_id': { $in: user.cart}
		}).then(books=>{
			res.render('cart',{
				books:books,
				user:user
			})
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

//@Update cart
app.get('/cart/:id',(req,res)=>{
	User.update(
    { _id: '5c23dddc2e735f025cc4cef3' }, 
    { $pull: { cart: { $in: req.params.id }} }
	).then(doc=>{
		res.redirect('/cart');
	})
})