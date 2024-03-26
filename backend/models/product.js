const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    _id: String, 
    cost: Number
  },
  { 
    versionKey: false 
  });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;