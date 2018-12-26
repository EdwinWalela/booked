const mongoose =require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = Schema({
    username:String,
    cart:Array,
})

const User = mongoose.model('users',UserSchema);

module.exports = User;