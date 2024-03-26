const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    _id: String, 
    created_at: Date, 
    total: Number, 
    products: [String], 
    refundedProducts: [String], 
    refundedAmount: Number,
    financialStatus: String
  },
  { 
    versionKey: false 
  });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;