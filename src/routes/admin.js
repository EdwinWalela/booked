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
    res.redirect('/admin/dashboard');
})

Router.get('/dashboard',(req,res)=>{
    let filter = req.query.filter;
	let criteria = {
        status:0
    };

	if(filter === 'pending'){
        criteria = {
            status:0
        };
	}else if(filter === 'confirmed'){
		criteria = {
            status:1
		}; 
	}else if(filter === 'assigned'){
		criteria = {
            status:2
		};
	}else if(filter === 'completed'){
		criteria = {
            status:3
		};
    }else if(filter === 'revoked'){
		criteria = {
            status:4
		};
    }else if(filter === 'all'){
		criteria = {
            
		};
    }
    let orders = Order.find(criteria).sort({_id:-1});
    Promise.all([orders]).then(values=>{
        res.render('admin/dashboard',{
            orders:values[0],
            filter:req.query.filter,
        });
    })
})

Router.get('/books',(req,res)=>{
    let filter = req.query.filter;
	let criteria = {
        available:true
    };

	if(filter === 'available'){
        criteria = {
            available:true
        };
	}else if(filter === 'sold'){
		criteria = {
            available:false
        }; 
    }

    let books = Book.find(criteria).sort({_id:-1});
    Promise.all([books]).then(values=>{
        res.render('admin/books',{
            books:values[0],
            filter:req.query.filter,
        });
    })
    
})

Router.get('/book/:id',(req,res)=>{
    let book = Book.findById(req.params.id);
    Promise.all([book]).then(values=>{
        res.render('admin/bookedit',{
            book:values[0]
        })
    })
})

Router.get('/newbook',(req,res)=>{
    res.render('admin/newbook')
})

Router.post('/bookedit/:id',(req,res)=>{
    let book = req.body;
    Book.findByIdAndUpdate(req.params.id,
        {
            title:book.title,
            author:book.author,
            isbn:book.isbn,
            thumb:'',
            synopsis:book.synopsis,
            price:book.price,
            condition:book.condition,
            cat:book.cat.split(' '),
            pages:book.pages,
            available:book.available
        }
    ).then(doc=>{
        res.redirect('/admin/book/'+req.params.id);
    })
})

Router.get('/order/:id',(req,res)=>{
    let order = Order.findById(req.params.id);
    let deliverers = User.find({role:{$lte:1}});
    Promise.all([order,deliverers]).then(values=>{
        res.render('admin/ordersummary',{
            order:values[0],
            deliverers:values[1]
        })
    })
})

Router.get('/order/confirm/:id',(req,res)=>{
    Order.findByIdAndUpdate(req.params.id,{status:1}).then(doc=>{
        res.redirect('/admin/dashboard');
    })
})

Router.post('/book',(req,res)=>{
    let book = req.body;
    Book.findOne({isbn:book.isbn}).then(docs=>{
        if(docs){
			res.redirect('/admin/books')
        }else{
            new Book({
                title:book.title,
                author:book.author,
                isbn:book.isbn,
                thumb:'',
                synopsis:book.synopsis,
                price:book.price,
                condition:book.condition,
                cat:book.cat.split(' '),
                pages:book.pages,
                available:true
            }).save().then(doc=>{
               res.redirect('/admin/books')
            }).catch(err=>{
                res.status(500).send({err:err});
            })
        }
    })
})

Router.get('/order/:orderId/assign/:userId',(req,res)=>{
    let deliverer = User.findById(req.params.userId);

    Promise.all([deliverer]).then(values=>{
        let deliveryPerson = values[0];

        if(deliveryPerson.role !== 2){
            let delivererDetails = {
                id:deliveryPerson._id,
                name:deliveryPerson.name,
                contact:deliveryPerson.contact
            };
            Order.findByIdAndUpdate(req.params.orderId,{
                deliverer:delivererDetails,
                status:2
            }).then(result=>{
                res.redirect('/admin/order/'+req.params.orderId)
            })
        }else{
            res.redirect('/admin/order/'+req.params.orderId)
        }
    })
})

Router.get('/order/revoke/:id',(req,res)=>{
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

		let revokeOrder = Order.findByIdAndUpdate(req.params.id,{status:4});
		Promise.all([unFlagTitles,revokeOrder]).then(values=>{
			res.redirect('/admin/dashboard');
		})
	})

})

Router.get('/coupons',(req,res)=>{
    let filter = req.query.filter;
	let criteria = {
        status:1
    };

	if(filter === 'active'){
        criteria = {
            status:1
        };
	}else if(filter === 'inactive'){
		criteria = {
            status:0
		}; 
    }else if(filter === 'all'){
		criteria = {
            
		};
    }
    let coupons = Coupon.find(criteria).sort({_id:-1});
    Promise.all([coupons]).then(values=>{
        res.render('admin/coupons',{
            coupons:values[0],
            filter:req.query.filter,
        });
    })
})

Router.get('/coupon/:id',(req,res)=>{
    let coupon = Coupon.findById(req.params.id);
    Promise.all([coupon]).then(values=>{
        res.render('admin/couponedit',{
            coupon:values[0]
        })
    })
})

Router.get('/newcoupon',(req,res)=>{
    res.render('admin/newcoupon')
})

Router.post('/newcoupon',(req,res)=>{
    let coupon = req.body;
    new Coupon({
        name:coupon.name.toUpperCase(),
        value:coupon.value,
        status:1
    }).save().then(doc=>{
        res.redirect('/admin/coupons')
    }).catch(err=>{
        res.status(500).send({err:err});
    })
})

Router.post('/couponedit/:id',(req,res)=>{
    let coupon = req.body;
    Coupon.findByIdAndUpdate(req.params.id,
        {
            name:coupon.name,
            value:coupon.value,
            status:coupon.status
        }
    ).then(doc=>{
        res.redirect('/admin/coupon/'+req.params.id);
    })
})

Router.get('/users',(req,res)=>{
    let filter = req.query.filter;
	let criteria = {
        
    };

	if(filter === 'admin'){
        criteria = {
            role:0
        };
	}else if(filter === 'delivery'){
		criteria = {
            role:1
		}; 
    }else if(filter === 'basic'){
		criteria = {
            role:2
		};
    }else if(filter === 'all'){
		criteria = {};
    }
    let users = User.find(criteria).sort({role:1});
    Promise.all([users]).then(values=>{
        res.render('admin/users',{
            users:values[0],
            filter:req.query.filter,
        });
    })
})

Router.get('/updaterole/:role/:id',(req,res)=>{
    let role = 2;
    if(req.params.role == 'admin'){
        role = 0;
    }else if(req.params.role == 'delivery'){
        role = 1;
    }else if(req.params.role == 'basic'){
        role = 2;
    }
    let updateRole = User.findByIdAndUpdate(req.params.id,
    {
        role:role
    });
    Promise.all([updateRole]).then(value=>{
        res.redirect('/admin/users');
    })
})


module.exports = Router;