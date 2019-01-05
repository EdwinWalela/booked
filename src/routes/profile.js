const Router = require('express').Router();
const Book = require('../models/book');
const User = require('../models/user');

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
    let relatedTitles = Book.find({}).skip(15).limit(4);
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
   console.log(req.body)
   let body = req.body
   let address = []
   address.push(body.street.trim())
   address.push(body.estate.trim())
   address.push(body.numb.trim())
   address.push(body.area.trim())
   User.findByIdAndUpdate(req.user.id,{
       address:address,
       mobile:body.mobile.trim()
   }).then(doc=>{
        res.redirect('/cart');
   })
  
})

module.exports = Router;