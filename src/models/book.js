const mongoose =require('mongoose');
const Schema = mongoose.Schema;

const BookSchema = Schema({
    title:String,
    author:String,
    isbn:Number,
    thumb:String,
    synopsis:String,
    price:Number,
    condition:Number,
    cat:[String],
    pages:Number,
})

const Book = mongoose.model('books',BookSchema);

module.exports =Book;