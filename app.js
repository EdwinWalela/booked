const express = require('express');
const app = express();

app.use('/assets',express.static('assets'))

app.listen(3000,()=>{
    console.log('listening on port')
})

app.get('/',(req,res)=>{
    console.log('/')
    res.sendFile(__dirname+'/index.html');
})
app.get('/search',(req,res)=>{
    console.log('/')
    res.sendFile(__dirname+'/search.html');
})
app.get('/book',(req,res)=>{
    console.log('/')
    res.sendFile(__dirname+'/book.html');
})
app.get('/cart',(req,res)=>{
    console.log('/')
    res.sendFile(__dirname+'/cart.html');
})