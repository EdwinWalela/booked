const mongoose =require('mongoose');
const Schema = mongoose.Schema;

const BookSchema = Schema({
    bookID:{type: Schema.Types.ObjectId, ref: "books"},
    images:String
})

const Book = mongoose.model('books',BookSchema);

module.exports =Book;