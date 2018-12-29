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
	let relatedTitles = Book.find({}).limit(4);
	if(true){
		User.findById('5c23dddc2e735f025cc4cef3').then(user=>{
			Promise.all([relatedTitles]).then(values=>{
				res.render('index',{
					user:user,
					relatedTitles:values[0]
				});
			})
			
		})
	}else{
		res.render('index',{user:false})
	}
})

app.get('/search',(req,res)=>{
	let relatedTitles = Book.find({}).limit(4);
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
						Promise.all([relatedTitles]).then(values=>{
							res.render('search',{
								user:user,
								books:books,
								relatedTitles:values[0]
							});
						})
					});
			}else{
				Book.find({}).limit(60).then((books)=>{
					Promise.all([relatedTitles]).then(values=>{
						res.render('search',{
							books:books,
							user:user,
							relatedTitles:values[0]
						});
					});
				})
			}
		})
	}else{
		// not logged in
	}
})

app.get('/cat/:catname',(req,res)=>{
	let relatedTitles = Book.find({}).limit(4);

	if(true){
		User.findById('5c23dddc2e735f025cc4cef3').then(user=>{
				Book.find({}).limit(60).then((books)=>{
					Promise.all([relatedTitles]).then(values=>{
						res.render('search',{
							books:books,
							user:user,
							relatedTitles:values[0]
						});
					});
				})
			});
	}else{
		// not logged in
	}
})

app.get('/book/:id',(req,res)=>{
	let relatedTitles = Book.find({}).limit(4);
	if(true){
		User.findById('5c23dddc2e735f025cc4cef3').then(user=>{
			Book.findById(req.params.id).then(book=>{
				Promise.all([relatedTitles]).then(values=>{
					res.render('book',{
						book:book,
						user:user,
						relatedTitles:values[0]
					});
				});
			})
		});
	}else{
		// not logged in
	}
})

app.get('/cart',(req,res)=>{
	let relatedTitles = Book.find({}).limit(4);
	
	User.findById('5c23dddc2e735f025cc4cef3').then(user=>{
		Book.find({
			'_id': { $in: user.cart}
		}).then(books=>{
			Promise.all([relatedTitles]).then(values=>{
				res.render('cart',{
					books:books,
					user:user,
					relatedTitles:values[0]
				})
			});
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