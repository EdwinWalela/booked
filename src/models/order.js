const mongoose =require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = Schema({
  orderNumb:Number,
  user:String,
  items:Array,
  totalAmount:Number,
  address:String,
  date:Date,
  deliverer: {
    id:{ type: String},
    name: { type: String, trim: true },
    contact: { type: String, trim: true }
  },
  userContact:String,
  status:Number,
  deliveredDate:Date,
  coupon:{
    name: { type: String, trim: true },
    value: { type: Number, trim: true },
    status:{type: Number, trim: true }
  }
})

const Order = mongoose.model('orders',OrderSchema);

module.exports = Order;