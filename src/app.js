const express = require('express');
const mongoose =require('mongoose');
const flash = require('flash')
const session = require('express-session');
const passport = require('passport');
const cookieSession = require('cookie-session');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const Book = require('./models/book');
const User =require('./models/user');
const adminRoutes =require('./routes/admin');
const authRoutes =require('./routes/auth');
const profileRoutes = require('./routes/profile');

const app = express();

const authCheck = (req,res,next)=>{
    if(req.user){
        next();
    }else{
        res.redirect('/auth/login')
    }
}

mongoose.connect(process.env.DB_URI,{useNewUrlParser:true},()=>{
    console.log('connected to db')
})
app.listen(process.env.PORT,()=>{
    console.log(`listening to requests on port ${process.env.PORT}`);
})


app.set('view engine', 'ejs');
app.use('/assets',express.static('assets'));
app.use(express.urlencoded({extended:false}));
app.use(cookieSession({
	maxAge:240*60*60*1000,
	keys:['123213ewrwer']
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req,res,next)=>{
	let sort;
	if(Math.random() == 1){
		sort = 1;
	}else{
		sort = -1;
	}
	Book.find({
		available:true
	}).limit(6).sort({condition:sort}).then(titles=>{
		res.locals = titles;
		next();
	})
})
app.use('/admin',adminRoutes);
app.use('/auth',authRoutes);
app.use('/profile',profileRoutes);



passport.use(new LocalStrategy(
	{usernameField:"email", passwordField:"password"},
	function(email,password,done){
		User.findOne({email:email},function(err,user){
			if(err){return err}
			if(!user){
				return done(null,false,{message:'Unknown User'})
			}else{
				bcrypt.compare(password,user.password).then(function(res){
					console.log(res)
						if(res){
							return done(null,user)
						}else{
							return done(null,false,{message:'invalid password'})
						}		
				})
			}
		})
		}
	))

passport.serializeUser(function(user,done){
	done(null,user.id)
})

passport.deserializeUser(function(id,done){
	User.findById(id,function(err,user){
		done(err,user);
	})
})

app.post('/auth/login',passport.authenticate('local',
{
	successRedirect:'/search',
	failureRedirect:'/auth/login?fail=true',
	failureFlash:false
}))

app.get('/auth/logout',(req,res)=>{
	req.logOut();
	res.redirect('/')
})

app.get('/',(req,res)=>{
	let relatedTitles = Book.find({available:true}).skip(13).limit(4);
	let romance = Book.find({$and:[
		{cat:'romance'},
		{available:true}
	]}).count();
	let fiction = Book.find({$and:[
		{cat:'fiction'},
		{available:true}
	]}).count();
	let motivational =  Book.find({$and:[
		{cat:'motivational'},
		{available:true}
	]}).count();
	let crime =  Book.find({$and:[
		{cat:'crime'},
		{available:true}
	]}).count();
	let religon =  Book.find({$and:[
		{cat:'religon'},
		{available:true}
	]}).count();
	let truestory =  Book.find({$and:[
		{cat:'truestory'},
		{available:true}
	]}).count();

	let latestArrivals = Book.find({available:true}).sort({'_id':-1});

		Promise.all([relatedTitles,romance,fiction,motivational,crime,religon,truestory,latestArrivals]).then(values=>{
			res.render('index',{
				user:req.user,
				searchSuggestions:res.locals,
				relatedTitles:values[0],
				romance:values[1],
				fiction:values[2],
				motivational:values[3],
				crime:values[4],
				religon:values[5],
				truestory:values[6],
				latestArrivals:values[7]
			});
		})
})

app.get('/search',(req,res)=>{
	let relatedTitles = Book.find({available:true}).skip(7).limit(4);
	let filter = req.query.filter;
	let sort = {};

	if(filter === 'price (lowest)'){
		sort = {
			price:1
		};
	}else if(filter === 'price (highest)'){
		sort = {
			price:-1
		}; 
	}else if(filter === 'condition'){
		sort = {
			condition:-1
		};
	}
	
	let queryString = req.query.q;
	if(queryString){
		Book.find({$and:[
			{name:queryString},
			{available:true}
		]})
			.limit(16)
			.sort(sort)
			.then((books)=>{
				Promise.all([relatedTitles]).then(values=>{
					res.render('search',{
						user:req.user,
						books:books,
						relatedTitles:values[0],
						filter:req.query.filter,
						searchSuggestions:res.locals
					});
				})
			});
	}else{
		Book.find({available:true})
		.limit(60)
		.sort(sort)
		.then((books)=>{
			Promise.all([relatedTitles]).then(values=>{
				res.render('search',{
					books:books,
					user:req.user,
					relatedTitles:values[0],
					filter:req.query.filter,
					searchSuggestions:res.locals
				});
			});
		})
	}

	
})

app.get('/cat/:catname',(req,res)=>{
	let relatedTitles = Book.find({}).limit(4);
	let filter = req.query.filter;
	let sort = {};
	if(filter === 'price (lowest)'){
		sort = {
			price:1
		};
	}else if(filter === 'price (highest)'){
		sort = {
			price:-1
		}; 
	}else if(filter === 'condition'){
		sort = {
			condition:-1
		};
	}
		Book.find({$and:[
			{cat:req.params.catname},
			{available:true}
		]})
			.limit(60)
			.sort(sort)
			.then((books)=>{
				Promise.all([relatedTitles]).then(values=>{
					res.render('search',{
						books:books,
						user:req.user,
						relatedTitles:values[0],
						filter:req.query.filter,
						searchSuggestions:res.locals
					});
				});
			})
})

app.get('/book/:id',(req,res)=>{
	let relatedTitles = Book.find({available:true}).skip(8).limit(4);
		Book.findById(req.params.id).then(book=>{
			Promise.all([relatedTitles]).then(values=>{
				book.title = book.title.charAt(0).toUpperCase() + book.title.slice(1);
				res.render('book',{
					book:book,
					user:req.user,
					relatedTitles:values[0],
					searchSuggestions:res.locals
				});
			});
		})
})

app.get('/cart',authCheck,(req,res)=>{
	let relatedTitles = Book.find({available:true}).skip(10).limit(4);
		Book.find({
			'_id': { $in: req.user.cart || null}
		}).then(books=>{
			Promise.all([relatedTitles]).then(values=>{
				res.render('cart',{
					books:books,
					user:req.user,
					relatedTitles:values[0],
					searchSuggestions:res.locals
				})
			});
		})
})

app.post('/cart/:id',(req,res)=>{
	if(typeof req.user !== "undefined"){
		User.findById(req.user._id).then(user=>{
			if(!user.cart.includes(req.params.id)){
				User.update(
					{ _id: req.user._id }, 
					{ $push: { cart: req.params.id } },
				).then(doc=>{
					res.redirect('/book/'+req.params.id)
				}) 
			}
		})
	}else{
		console.log('redirecting')
		res.redirect('/auth/login?redirect='+req.params.item)
	}
})

//@Update cart
app.get('/cart/:id',(req,res)=>{
	User.update(
    { _id: req.user._id }, 
    { $pull: { cart: { $in: req.params.id }} }
	).then(doc=>{
		res.redirect('/cart');
	})
})