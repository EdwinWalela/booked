const mongoose =require('mongoose');
const Schema = mongoose.Schema;

const CouponSchema = Schema({
    name:String,
    value:Number,
    status:Number
})

const Coupon = mongoose.model('coupons',CouponSchema);

module.exports = Coupon;