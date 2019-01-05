const mongoose =require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = Schema({
    email:String,
    name:String,
    cart:Array,
    mobile:String,
    password:String,
    orders:Array,
    address:[String]
})

const User = mongoose.model('users',UserSchema);

module.exports = User;