const Router = require('express').Router();
const Book = require('../models/book');
const User = require('../models/user');
const Order = require('../models/order')

const AREAS = [
"cbd",
"dandora",
"donholm",
"embakasi",
"karen",
"karura",
"kasarani",
"kileleshwa",
"kilimani",
"kitusuru",
"langata",
"lavington",
"nairobi west",
"parklands/highridge",
"rongai",
"ruaraka",
"south b",
"south c",
"starehe",
"umoja",
"westlands",
"woodley"
]

const authCheck = (req,res,next)=>{
    if(req.user){
        next();
    }else{
        res.redirect('/auth/login')
    }
}

Router.get('/price',(req,res)=>{
    Book.updateMany({},{$inc:{price:50}}).then(doc=>{
        res.redirect('/search')
    })
})


Router.get('/reset',(req,res)=>{
    Book.updateMany({},{available:true}).then(doc=>{
        res.redirect('/search')
    })
})

//@RENDER PROFILE
Router.get('/',authCheck,(req,res)=>{
    let relatedTitles = Book.find({available:true}).skip(15).limit(4);
    let pendingOrders = Order.find({
			$and:[
				{user:req.user._id},
				{$or:[
					{status:-1},
					{status:0}
				]}
			]}
		);
    let orderHistory = Order.find({
			$and:[
				{user:req.user._id},
				{status:1}
			]}
		); 
    Promise.all([relatedTitles,pendingOrders,orderHistory]).then(values=>{
        res.render('profile',{
            areas:AREAS,
            user:req.user,
            relatedTitles:values[0],
						searchSuggestions:res.locals,
						pendingOrders:values[1],
						orderHistory:values[2],
            successOrder:req.query.successorder
        });
    });
})

//@UPDATE PROFILE
Router.post('/',(req,res)=>{
   let body = req.body
   let address = [];
   address.push(body.estate.trim())
   if(body.numb){address.push(body.numb.trim())}else{address.push('')};
   address.push(body.area.trim())

   User.findByIdAndUpdate(req.user.id,{
       address:address,
       mobile:body.mobile.trim()
   }).then(doc=>{
        res.redirect('/cart');
   })
})

//@PLACE ORDER
Router.get('/checkout',(req,res)=>{
		let orderCount = Order.find({}).count();
		let orderNumb;
		Promise.all([orderCount]).then(value=>{
			orderNumb = Number(value[0]);
			orderNumb+=1;
			
			Book.find({$and:[
					{available:true},
					{'_id': { $in: req.user.cart}}
			]}).then(titles=>{
					let price = 0;
					let delivery = 0;
					let serviceFee = 0;
					titles.forEach(title=>{
							price+=Number(title.price)
					})

					serviceFee = price*0.1
					if(req.user.address[2] !== 'cbd'){delivery = 100}
					total = price + delivery + serviceFee;
					new Order({
						orderNumb:orderNumb,
						user:req.user._id,
						items:titles,
						totalAmount:total,
						address:req.user.address.toString(),
						date:new Date(),
						contact:'0706496885',
						status:-1,
					}).save().then(newOrder=>{
						let flagTitles = Book.updateMany(
								{'_id': { $in: req.user.cart}},
								{available:false}
						)
						let emptyCart = User.update(
							{ _id: req.user._id }, 
							{ $set: { cart: [] }}
						)
						Promise.all([flagTitles,emptyCart]).then(values=>{
							res.redirect('/profile?successorder=true')
						})
					});
			})
		}) 
})

//@CANCEL ORDER
Router.get('/cancel/:id',(req,res)=>{
	let order = Order.findById(req.params.id);
	Promise.all([order]).then(values=>{
		let books = [];

		values[0].items.forEach(item=>{
			books.push(item._id);
		})
		console.log(books)

		let unFlagTitles = Book.updateMany(
			{'_id': { $in: books}},
			{available:true}
		)

		let deleteOrder = Order.findByIdAndDelete(req.params.id);
		Promise.all([unFlagTitles,deleteOrder]).then(values=>{
			res.redirect('/profile');
		})
	})

})

module.exports = Router;