const mongoose =require('mongoose');
const Schema = mongoose.Schema;

const IdSchema = Schema({
    id:String
})

const ID = mongoose.model('order-ids',IdSchema);

module.exports =ID;