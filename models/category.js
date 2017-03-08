const mongoose = require('mongoose');

let schema = new mongoose.Schema({
  name: {type: String, required: true},
  description: {type:String, required: true},
  products: [{type: mongoose.Schema.Types.ObjectId, ref:'Product'}],
  url: String //OOOOOOOOOOOOOOOOO GAMBIARA
});

module.exports = mongoose.model('Category',schema);
