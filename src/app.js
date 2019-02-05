const express = require('express');
const mongoose =require('mongoose');
const FacebookStrategy = require('passport-facebook').Strategy;
const flash = require('flash')
const session = require('express-session');
const passport = require('passport');
const cookieSession = require('cookie-session');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const sequential = require("sequential-ids");
const path = require("path");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const tinify = require("tinify");
const config = require("./config");
tinify.key = config.TINIFYKEY;
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(config.MAILERKEY);

const Book = require('./models/book');
const User =require('./models/user');
const Coupon = require('./models/coupon')

const adminRoutes =require('./routes/admin');
const authRoutes =require('./routes/auth');
const profileRoutes = require('./routes/profile');
const deliveryRoutes = require('./routes/delivery');


const app = express();

// GRID-FS Config
mongoose.connect(config.DB_URI,{ useNewUrlParser: true });

// initialize gridfs
let gfs
mongoose.connection.once('open',()=>{
    gfs = Grid(mongoose.connection.db,mongoose.mongo);
    gfs.collection('bookcovers');
    console.log('connected to db')
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, __dirname+'/public/bookcovers')
    },
    filename: function (req, file, cb) {
      cb(null, req.body.isbn+'-'+Date.now()+path.extname(file.originalname))
    }
  })

const upload = multer({storage});

{
// var generator = new sequential.Generator({
// 	digits: 6, letters: 3,
// 	restore: "AAA - 000"
//   });
// generator.start();
}

const authCheck = (req,res,next)=>{
    if(req.user){
        next();
    }else{
		req.session.returnTo = req.params.id; 
        res.redirect('/auth/login')
    }
}

const roleCheck = (req,res,next)=>{
	if(req.user.role == 2){
		// if(res.locals.bookredirect){
		// 	res.redirect('/book/'+req.body.redirect);
		// }else{
			res.redirect('/')
		// }
	}else if(req.user.role === 1){
		res.redirect('/deliveries/dashboard')
	}else if(req.user.role === 0){
		res.redirect('/admin/dashboard')
	}
}

app.listen(config.PORT,()=>{
    console.log(`listening to requests on port ${config.PORT}`);
})

app.set('view engine', 'ejs');
app.use('/public',express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({extended:false}));
app.use(cookieSession({
	maxAge:240*60*60*1000,
	keys:['34*1 9/:" }{ 810_']
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
	}).limit(4).sort({condition:sort}).then(titles=>{
		res.locals = titles;
		next();
	})
})
app.use('/admin',adminRoutes);
app.use('/auth',authRoutes);
app.use('/profile',profileRoutes);
app.use('/deliveries',deliveryRoutes);


  

passport.use(new LocalStrategy(
	{usernameField:"email", passwordField:"password"},
	function(email,password,done){
		User.findOne({email:email},function(err,user){
			if(err){return err}
			if(!user){
				return done(null,false,{message:'Unknown User'})
			}else{
				bcrypt.compare(password,user.password).then(function(res){
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

passport.use(new FacebookStrategy({
	clientID: config.FB_APP_ID,
	clientSecret: config.FB_APP_SECRET,
	callbackURL: "https://booktap.co.ke/auth/facebook/callback"
	},
	function(accessToken, refreshToken, profile, done) {
		User.findOne({fbID:profile.id}).then(user=>{
			if(!user){
				User({
					fbID:profile.id,
					email: '-',
					name:profile.displayName,
					cart:[],
					mobile:'',
					orders:[],
					address:[]
				}).save().then(newUser=>{
					done(null,newUser);
				})
			}else{
				done(null,user);
			}
		})
	}
));

passport.serializeUser(function(user,done){
	done(null,user.id)
})

passport.deserializeUser(function(id,done){
	User.findById(id,function(err,user){
		done(err,user);
	})
})

//---- PASSPORT AUTH ROUTES -----//
app.post('/auth/login',passport.authenticate('local',
{
	failureRedirect:'/auth/login?fail=true',
	failureFlash:false
}),authCheck,(req,res)=>{
	if(req.session.returnTo){
		res.redirect('/book/'+req.session.returnTo);
	}else{
		res.redirect('/')
	}
    delete req.session.returnTo;
});

app.get('/auth/facebook',passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
	passport.authenticate('facebook',{failureRedirect:'/auth/login?fail=true'}),roleCheck)

app.get('/auth/logout',(req,res)=>{
	req.logOut();
	res.redirect('/')
})

app.post('/auth/resetpassword',(req,res)=>{
	User.findById(req.body.id).then(user=>{
		bcrypt.hash(req.body.password, 10).then(function(hash) {
			User.findByIdAndUpdate(req.body.id,{password:hash}).then(doc=>{
				res.redirect('/auth/login?reset=true');
			})
		});
    })
})

//-------  --------//

//@ADMIN NEWBOOK
app.post('/admin/book',upload.array('gallery',4),(req,res)=>{
	let book = req.body;
	let bookGallery = [];
	for(let i = 0; i < req.files.length;i++){
		bookGallery.push(req.files[i].filename);
	}
    Book.findOne({isbn:book.isbn}).then(docs=>{
        if(docs){
			res.redirect('/admin/books')
        }else{
            new Book({
                title:book.title,
                author:book.author,
                isbn:book.isbn,
                synopsis:book.synopsis,
                price:book.price,
                condition:book.condition,
                cat:book.cat.split(','),
				pages:book.pages,
				gallery:bookGallery,
                available:true
            }).save().then(doc=>{
			   res.redirect('/admin/books');
			   req.files.forEach(file=>{
				const source = tinify.fromFile("./src/public/bookcovers/"+file.filename)
				.toFile("./src/public/bookcovers/"+file.filename,(err=>{
					if(err){console.log(err)};
					console.log(file.filename+" - compressed")
				}))
			})
            }).catch(err=>{
                res.status(500).send({err:err});
            })
        }
    })
})

//@ADMIN EDITBOOK
app.post('/admin/bookedit/:id',upload.array('gallery',3),(req,res)=>{
	let book = req.body;
	let bookGallery = [];
	for(let i = 0; i < req.files.length;i++){
		bookGallery.push(req.files[i].filename);
	}

    Book.findByIdAndUpdate(req.params.id,
        {
            title:book.title,
            author:book.author,
            isbn:book.isbn,
            synopsis:book.synopsis,
            price:book.price,
            condition:book.condition,
			cat:book.cat.split(' '),
			gallery:bookGallery,
            pages:book.pages,
            available:book.available
        }
    ).then(doc=>{
		res.redirect('/admin/book/'+req.params.id);
		req.files.forEach(file=>{
			const source = tinify.fromFile("./src/public/bookcovers/"+file.filename)
			.toFile("./src/public/bookcovers/"+file.filename,(err=>{
				if(err){console.log(err)};
				console.log(file.filename+" - compressed")
			}))
		})
    })
})

//@PASS-RESET
app.post('/auth/verifyaccount',(req,res)=>{
	const msg = {
		to: '',
		from: 'booktapinfo@gmail.com',
		subject: 'Password Reset',
		text: '',
		html: '',
	  };
	  let findUser = User.findOne({email:req.body.email});
	  Promise.all([findUser]).then(user=>{
		  if(user){
			let msg = {
				to: user[0].email,
				from: 'booktapinfo@gmail.com',
				subject: 'Password Reset',
				html: `
					<div style="margin:4em auto;font-family:sans-serif;text-align: center;">
						<h1>Password Reset</h1>
						<p>Did you request a password reset?</p>
						<a href="https://booktap.co.ke/auth/resetpassword?token=2bZASs910SLK21KAp3Ss91ZA2bZASs910SLK21KAp3Ss910SLK21KAp3&userID=${user[0]._id}"><button style="border:none; font-size:1.2em;padding:10px;background:#3066BE;color:#ffffff">Reset Password</button></a>
						<p>If you did not request for a password reset, just ignore this email.</p>
					</div>
				`,
			  };
			  sgMail.send(msg).then(mail=>{
				  console.log('email sent successfuly;')
			  }).catch(err=>{
				  console.log('email not sent',err);
			  });
			res.redirect('/auth/verifyaccount?account=true');
		  }else{
			  res.redirect('/auth/verifyaccount?account=false');
		  }
	  })
	
})

// ----- INDEX ROUTES  -------//

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
		{cat:'motivation'},
		{available:true}
	]}).count();
	let crime =  Book.find({$and:[
		{cat:'crime'},
		{available:true}
	]}).count();
	let religon =  Book.find({$and:[
		{cat:'religion'},
		{available:true}
	]}).count();
	let truestory =  Book.find({$and:[
		{cat:'true-story'},
		{available:true}
	]}).count();

	let latestArrivals = Book.find({available:true}).limit(6).sort({'_id':-1});

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
	let sort = {_id:-1};

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
	let orderCoupon = req.query.coupon
	let coupon = Coupon.findOne({$and:[{name:orderCoupon},{status:1}]});
	let relatedTitles = Book.find({available:true}).skip(10).limit(4);
	
		Book.find({
			'_id': { $in: req.user.cart || null}
		}).then(books=>{
			Promise.all([relatedTitles,coupon]).then(values=>{
				res.render('cart',{
					books:books,
					user:req.user,
					relatedTitles:values[0],
					searchSuggestions:res.locals,
					coupon:values[1]
				})
			});
		})
})


app.post('/cart/verifycoupon',(req,res)=>{
	let coupon = req.body.coupon.toUpperCase()
	res.redirect('/cart?coupon='+coupon+"#place-order")
})

app.post('/cart/:id',(req,res,next)=>{
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
		authCheck(req,res,next);
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