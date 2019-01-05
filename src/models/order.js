const mongoose =require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = Schema({
  orderNumb:Number,
  items:Array,
  totalAmount:Number,
  address:String,
  date:Date,
  contact:String,
  flag:Boolean,
  Delivered:Date
})

const Order = mongoose.model('orders',OrderSchema);

module.exports = Order;