const mongoose =require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = Schema({
    fbID:String,
    email:String,
    name:String,
    cart:Array,
    mobile:String,
    password:String,
    orders:Array,
    address:[String],
    role:Number
})

const User = mongoose.model('users',UserSchema);

module.exports = User;