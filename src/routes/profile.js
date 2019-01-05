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

Router.get('/',authCheck,(req,res)=>{
    let relatedTitles = Book.find({available:true}).skip(15).limit(4);
    Promise.all([relatedTitles]).then(values=>{
        res.render('profile',{
            areas:AREAS,
            user:req.user,
            relatedTitles:values[0],
            searchSuggestions:res.locals
        });
    });
})

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

Router.get('/checkout',(req,res)=>{
    Book.find({$and:[
        {available:true},
        {'_id': { $in: req.user.cart || null}}
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
					orderNumb:1,
					items:titles,
					totalAmount:total,
					address:req.user.address.toString(),
					date:new Date(),
					contact:'0706496885',
					complete:false,
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
						res.redirect('/cart')
					})
				});
    })
})

module.exports = Router;