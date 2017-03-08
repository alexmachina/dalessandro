const mongoose = require('mongoose');

let schema = new mongoose.Schema({
  category: {type:mongoose.Schema.Types.ObjectId, ref:'Category', required:true},
  name: String,
  description: String,
  price: Number,
  mainImage: String,
  images:[String],
  active: {type: Boolean, required:true},
  featured: {type: Boolean, required:true},
});

module.exports = mongoose.model('Product', schema);
