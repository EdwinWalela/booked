const Router = require('express').Router();
const Book = require('../models/book');
const Order = require('../models/order');
const Coupon = require('../models/coupon');
const User = require('../models/user')

const roleCheck = (req,res,next)=>{
    if(req.user.role !== 0){
        res.redirect('/search')
    }else{
        next();
    }
}

Router.get('/',(req,res)=>{
    res.redirect('/deliveries/dashboard');
})

Router.get('/dashboard',(req,res)=>{
    let filter = req.query.filter;
	let status=2;

	if(filter === 'pending'){
        status=2;
	}else if(filter === 'in-progress'){
		status=10;
	}else if(filter === 'completed'){
		status=3;
	}else if(filter === 'all'){
		status={}
    }
    let orders = Order.find({$and:[{"status":status},{"deliverer.id":req.user._id}]}).sort({_id:-1});
    Promise.all([orders]).then(values=>{
        res.render('delivery/dashboard',{
            orders:values[0],
            filter:req.query.filter,
        });
    })
})

Router.get('/order/:id',(req,res)=>{
    let order = Order.findById(req.params.id);
    Promise.all([order]).then(values=>{
        res.render('delivery/ordersummary',{
            order:values[0],
        })
    })
})

Router.get('/order/:id/start',(req,res)=>{
    let order = Order.findByIdAndUpdate(req.params.id,{status:10});
    Promise.all([order]).then(values=>{
        res.redirect('/delivery')
    })
})

Router.post('/order/:id/complete',(req,res)=>{
    let order = Order.findByIdAndUpdate(req.params.id,{status:3,deliveredDate:new Date()});
    Promise.all([order]).then(values=>{
        res.redirect('/deliveries')
    })
})


module.exports = Router;