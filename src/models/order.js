const mongoose =require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = Schema({
  orderNumb:Number,
  user:String,
  items:Array,
  totalAmount:Number,
  address:String,
  date:Date,
  contact:String,
  status:Number,
  deliveredDate:Date
})

const Order = mongoose.model('orders',OrderSchema);

module.exports = Order;