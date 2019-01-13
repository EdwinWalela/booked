const Router = require('express').Router();
const Book = require('../models/book');
const Order = require('../models/order');


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
    let orders = Order.find(criteria);
    Promise.all([orders]).then(values=>{
        res.render('admin/dashboard',{
            orders:values[0],
            filter:req.query.filter,
        });
    })
    
})

Router.get('/order/:id',(req,res)=>{
    let order = Order.findById(req.params.id);
    Promise.all([order]).then(values=>{
        res.render('admin/ordersummary',{
            order:values[0]
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
                cat:book.cat.split(' '),
                pages:book.pages,
                available:true
            }).save().then(doc=>{
                res.status(200).send('OK')
            }).catch(err=>{
                res.status(500).send({err:err});
            })
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


module.exports = Router;